#!/usr/bin/env bash
# Smoke test for supabase/setup.sql, seed.sql and migrations against throwaway
# Postgres containers. Requires Docker. Prints "SMOKE OK" on success.
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)"
IMAGE=postgres:16
CONTAINERS=()
TMP="$(mktemp -d)"

cleanup() {
  for c in ${CONTAINERS[@]+"${CONTAINERS[@]}"}; do docker rm -f -v "$c" >/dev/null 2>&1 || true; done
  rm -rf "$TMP"
}
trap cleanup EXIT

fail() { echo "SMOKE FAIL: $*" >&2; exit 1; }

start() { # sets CONTAINER (not in a subshell, so cleanup sees it)
  local name="smoke-pg-$$-$RANDOM"
  docker run -d --rm -e POSTGRES_PASSWORD=pw --name "$name" "$IMAGE" >/dev/null
  CONTAINERS+=("$name")
  local i
  for i in $(seq 1 60); do
    if docker exec "$name" psql -U postgres -tAc 'select 1' >/dev/null 2>&1; then
      # the image restarts postgres once after init; confirm it stays up
      sleep 1
      docker exec "$name" psql -U postgres -tAc 'select 1' >/dev/null 2>&1 && { CONTAINER="$name"; return; }
    fi
    sleep 1
  done
  fail "postgres did not become ready"
}

run_file() { docker exec -i -e PGOPTIONS="-c client_min_messages=warning" "$1" psql -U postgres -v ON_ERROR_STOP=1 -q -f - < "$2" >/dev/null; }
q() { docker exec "$1" psql -U postgres -v ON_ERROR_STOP=1 -tAc "$2"; }

expect() { # container, sql, expected, label
  local got; got="$(q "$1" "$2")"
  [ "$got" = "$3" ] || fail "$4: expected '$3', got '$got'"
  echo "  ok: $4 = $3"
}

counts() {
  expect "$1" "select count(*) from public.profile" 1 "profile rows"
  expect "$1" "select count(*) from public.site_sections" 4 "site_sections rows"
  expect "$1" "select count(*) from public.experiences" 4 "experiences rows"
  expect "$1" "select count(*) from public.projects" 4 "projects rows"
  expect "$1" "select count(*) from storage.buckets" 2 "storage buckets"
}

# Deterministic dump of content tables (no ids / timestamps).
dump() {
  docker exec "$1" psql -U postgres -v ON_ERROR_STOP=1 -q -c "
copy (
  select 'profile', row_to_json(t)::text from (select full_name,title,handle,headline,tagline,bio,avatar_url,resume_url,location,email,phone,career_start_date,now,highlights,socials,singleton from public.profile) t
  union all select 'sections', row_to_json(t)::text from (select key,label,enabled,sort_order from public.site_sections) t
  union all select 'experiences', row_to_json(t)::text from (select role,company,location,start_date,end_date,is_current,highlights,tags,sort_order from public.experiences) t
  union all select 'skills', row_to_json(t)::text from (select name,category,sort_order from public.skills) t
  union all select 'projects', row_to_json(t)::text from (select title,slug,summary,content,cover_image_url,tags,links,featured,label,status,sort_order from public.projects) t
  union all select 'achievements', row_to_json(t)::text from (select title,description,sort_order from public.achievements) t
  union all select 'education', row_to_json(t)::text from (select degree,institution,location,start_date,end_date,description,sort_order from public.education) t
  order by 1, 2
) to stdout"
}

cols() {
  q "$1" "select table_name||'.'||column_name||':'||data_type||':'||is_nullable from information_schema.columns where table_schema='public' order by 1"
}

echo "== 1. fresh: stubs -> setup.sql"
start; A="$CONTAINER"
run_file "$A" "$DIR/tests/stubs.sql"
run_file "$A" "$DIR/setup.sql"
counts "$A"
expect "$A" "select count(*) from public.projects where featured" 3 "featured projects"
expect "$A" "select count(*) from public.projects where label is not null" 4 "labelled projects"
expect "$A" "select count(*) from public.experiences where cardinality(tags) > 0" 4 "tagged experiences"
dump "$A" > "$TMP/setup-fresh.dump"

echo "== 2. re-run setup.sql after an edit (fill-if-empty, idempotent)"
q "$A" "update public.profile set handle='EDITED'" >/dev/null
q "$A" "update public.site_sections set enabled=false, sort_order=9 where key='blog'" >/dev/null
q "$A" "insert into public.site_sections (key,label) values ('legacy','Legacy')" >/dev/null
run_file "$A" "$DIR/setup.sql"
expect "$A" "select handle from public.profile" EDITED "edited handle survives"
expect "$A" "select enabled||'/'||sort_order from public.site_sections where key='blog'" "false/9" "edited section survives"
expect "$A" "select count(*) from public.site_sections where key='legacy'" 0 "unknown section removed"
counts "$A"

echo "== 3. seed.sql resets; matches a fresh setup.sql"
run_file "$A" "$DIR/seed.sql"
dump "$A" > "$TMP/seed.dump"
counts "$A"
run_file "$A" "$DIR/seed.sql"   # reset is itself re-runnable
dump "$A" > "$TMP/seed2.dump"
cmp -s "$TMP/seed.dump" "$TMP/seed2.dump" || fail "seed.sql is not re-runnable"
start; B="$CONTAINER"
run_file "$B" "$DIR/tests/stubs.sql"
run_file "$B" "$DIR/setup.sql"
dump "$B" > "$TMP/setup2.dump"
if ! diff "$TMP/seed.dump" "$TMP/setup2.dump" >/dev/null; then
  diff "$TMP/seed.dump" "$TMP/setup2.dump" | head -20 >&2
  fail "seed.sql and setup.sql content differ"
fi
cmp -s "$TMP/setup-fresh.dump" "$TMP/setup2.dump" || fail "setup.sql is not deterministic"
echo "  ok: seed dump == setup dump ($(wc -l < "$TMP/seed.dump" | tr -d ' ') rows)"

echo "== 4. migrations 0001..0006 match setup.sql schema"
start; C="$CONTAINER"
run_file "$C" "$DIR/tests/stubs.sql"
for f in "$DIR"/migrations/000[1-6]_*.sql; do run_file "$C" "$f"; done
cols "$A" > "$TMP/cols-setup"
cols "$C" > "$TMP/cols-mig"
diff "$TMP/cols-setup" "$TMP/cols-mig" || fail "column sets differ between setup.sql and migrations"
for col in profile.handle profile.tagline profile.career_start_date profile.now profile.now_updated_at profile.highlights \
           posts.source_title posts.source_url posts.source_kind posts.tldr experiences.tags projects.label subscribers.email; do
  grep -q "^$col:" "$TMP/cols-mig" || fail "missing column $col"
done
expect "$C" "select count(*) from storage.buckets" 2 "buckets from migrations"
run_file "$C" "$DIR/migrations/0006_personal_brand.sql"   # 0006 re-runnable
expect "$C" "select string_agg(key,',' order by sort_order) from public.site_sections" "projects,blog,newsletter,experience" "sections after 0006"

echo "== 5. constraints and policies"
bad() { # container, sql, label : must fail
  if docker exec "$1" psql -U postgres -v ON_ERROR_STOP=1 -q -c "$2" >/dev/null 2>&1; then fail "$3 should have been rejected"; fi
  echo "  ok: rejected $3"
}
for X in "$A" "$C"; do
  bad "$X" "insert into public.posts (title,slug,tldr) values ('t','s1','{a,b,c,d}')" "tldr > 3"
  bad "$X" "insert into public.posts (title,slug,source_kind) values ('t','s2','movie')" "bad source_kind"
  bad "$X" "insert into public.subscribers (email) values ('Mixed@Case.com')" "upper-case email"
  bad "$X" "insert into public.subscribers (email,status) values ('a@b.com','nope')" "bad subscriber status"
  q "$X" "insert into public.posts (title,slug,source_kind,tldr) values ('t','ok1','video','{a,b,c}')" >/dev/null
  q "$X" "insert into public.subscribers (email) values ('a@b.com')" >/dev/null
  expect "$X" "select string_agg(policyname,',' order by policyname) from pg_policies where tablename='subscribers'" "admin_all_subscribers,pub_insert_subscribers" "subscribers policies"
  expect "$X" "select with_check from pg_policies where policyname='pub_insert_subscribers'" "(status = 'active'::text)" "subscribe policy check"
done

echo "SMOKE OK"
