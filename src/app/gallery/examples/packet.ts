import type { Example } from './types'

export const packet: Example[] = [
  { title: 'TCP header', source: `packet-beta
0-15: "Source port"
16-31: "Destination port"
32-63: "Sequence number"
64-95: "Acknowledgement number"
96-99: "Data offset"
100-105: "Reserved"
106: "URG"
107: "ACK"
108: "PSH"
109: "RST"
110: "SYN"
111: "FIN"
112-127: "Window size"
128-143: "Checksum"
144-159: "Urgent pointer"
160-191: "Options and padding"` },

  { title: 'IPv4 header', source: `packet-beta
0-3: "Version"
4-7: "IHL"
8-13: "DSCP"
14-15: "ECN"
16-31: "Total length"
32-47: "Identification"
48-50: "Flags"
51-63: "Fragment offset"
64-71: "Time to live"
72-79: "Protocol"
80-95: "Header checksum"
96-127: "Source address"
128-159: "Destination address"
160-191: "Options"` },

  { title: 'UDP header', source: `packet-beta
0-15: "Source port"
16-31: "Destination port"
32-47: "Length"
48-63: "Checksum"
64-95: "Payload"` },

  { title: 'DNS message header', source: `packet-beta
0-15: "Transaction ID"
16: "QR"
17-20: "Opcode"
21: "AA"
22: "TC"
23: "RD"
24: "RA"
25-27: "Z"
28-31: "RCODE"
32-47: "Question count"
48-63: "Answer count"
64-79: "Authority count"
80-95: "Additional count"` },

  { title: 'Ethernet II frame', source: `packet-beta
0-47: "Destination MAC"
48-95: "Source MAC"
96-111: "EtherType"
112-143: "Payload, 46 to 1500 bytes"
144-175: "Frame check sequence"` },

  { title: 'TLS 1.3 record', source: `packet-beta
0-7: "Content type"
8-23: "Legacy record version"
24-39: "Length"
40-71: "Encrypted payload"
72-87: "Auth tag"` },

  { title: 'QUIC long header', source: `packet-beta
0: "Header form"
1: "Fixed bit"
2-3: "Long packet type"
4-7: "Type-specific bits"
8-39: "Version"
40-47: "Destination CID length"
48-79: "Destination connection ID"
80-87: "Source CID length"
88-119: "Source connection ID"
120-151: "Length and packet number"` },

  { title: 'HTTP/2 frame', source: `packet-beta
0-23: "Length"
24-31: "Type"
32-39: "Flags"
40: "Reserved"
41-71: "Stream identifier"
72-103: "Frame payload"` },

  { title: 'MQTT fixed header', source: `packet-beta
0-3: "Packet type"
4: "DUP"
5-6: "QoS level"
7: "RETAIN"
8-15: "Remaining length"
16-31: "Topic length"
32-63: "Topic name"
64-79: "Packet identifier"
80-111: "Payload"` },

  { title: 'ICMP echo request', source: `packet-beta
0-7: "Type"
8-15: "Code"
16-31: "Checksum"
32-47: "Identifier"
48-63: "Sequence number"
64-127: "Timestamp"
128-191: "Payload data"` },
]
