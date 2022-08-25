cd $(dirname "$0")

export HAUKI_USER='dev@hel.fi';
export HAUKI_RESOURCE='tprek:41835';
export HAUKI_KEY='d94c278085e49e807b67a58b8fcb92239b3fe881252f1938e3e0ca09611684b3790df3a22c08a32959309fdfcf074b4204c2f84a1ef03025621c4cf23a5521f24299ba857956a1fcf1b61715cb8154baeedba4e0409e636da9e91d7a618a4403e748c3a2';
export API_URL='https://hauki-api.test.hel.ninja/v1'
# export API_URL=http://localhost:8000/v1

export AUTH_PARAMS=$(node ../scripts/generate-auth-params.js)

k6 run "$@" 
