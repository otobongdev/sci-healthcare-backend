#!/usr/bin/env bash
#
# Switches the Prisma datasource from SQLite to Postgres.
#
# Prisma will not read the provider from an environment variable, so it has
# to be a literal in the schema. The committed schema uses `sqlite` on
# purpose: a contributor can clone this repo and have a working database with
# no services to install, which matters more for onboarding than it costs
# here. Deployment targets run this first.
set -euo pipefail

SCHEMA="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/prisma/schema.prisma"

if grep -q 'provider = "postgresql"' "$SCHEMA"; then
  echo "schema already targets postgresql"
  exit 0
fi

sed -i 's/provider = "sqlite"/provider = "postgresql"/' "$SCHEMA"
grep -q 'provider = "postgresql"' "$SCHEMA" || { echo "failed to switch provider"; exit 1; }
echo "schema switched to postgresql"
