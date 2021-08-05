import protons from 'protons'

const proto = protons(`
message WakuVote {
  string address = 1;
  string vote = 2;
  bytes  sntAmount = 3;
  string sign = 4;
  uint32 nonce = 5;
  uint64 sessionID = 6;
}

message WakuFeature {
  string voter = 1;
  bytes  sntAmount = 2;
  string publicKey = 3;
  uint64 timestamp = 4;
  string sign = 5;
}
`)

export default proto
