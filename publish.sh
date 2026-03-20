#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
DIST_DIR="$ROOT_DIR/dist/angular"
trap 'cd "$ROOT_DIR"' EXIT

# --- Pre-flight checks ---
echo "🔍 Running pre-flight checks..."

echo "  → Building library..."
npx ng build angular --configuration production

echo "  → Running tests..."
npx ng test angular --watch=false

echo "✅ All checks passed."

# --- Version info ---
NAME=$(node -p "require('$DIST_DIR/package.json').name")
VERSION=$(node -p "require('$DIST_DIR/package.json').version")
echo
echo "📦 Publishing: $NAME@$VERSION"

# --- Auth ---
USE_TOKEN=false
if [[ -n "${NPM_TOKEN:-}" ]]; then
  USE_TOKEN=true
  npm config set //registry.npmjs.org/:_authToken "${NPM_TOKEN}" >/dev/null
  echo "🔐 Using NPM_TOKEN for publish (no OTP required)."
fi

OTP=""

prompt_otp() {
  echo -n "Enter your npm OTP: "
  read -r OTP
  OTP="${OTP//[[:space:]]/}"
}

# --- Publish from dist ---
cd "$DIST_DIR"

if $USE_TOKEN; then
  npm publish --access public && { echo "✅ $NAME@$VERSION published"; exit 0; }
  echo "⚠️ Token-based publish failed. Falling back to OTP..."
  USE_TOKEN=false
fi

[[ -n "${OTP:-}" ]] || prompt_otp
while true; do
  set +e
  npm publish --access public --otp="$OTP"
  status=$?
  set -e
  [[ $status -eq 0 ]] && { echo "✅ $NAME@$VERSION published"; break; }
  echo -n "⚠️ Failed (exit $status). New OTP (Enter = retry): "
  read -r NEW_OTP
  NEW_OTP="${NEW_OTP//[[:space:]]/}"
  [[ -n "$NEW_OTP" ]] && OTP="$NEW_OTP"
  sleep 2
done

echo
echo "🎉 Done."
