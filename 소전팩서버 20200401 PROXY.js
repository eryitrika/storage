// 소전한패서버by익살가면
function FindProxyForURL(url, host) {
  if (shExpMatch(host, "oss-rescnf.gf.ppgame.com") || dnsDomainIs(host, "oss-rescnf.gf.ppgame.com")) {
      return "PROXY speedtest63120.synology.me:80"; 
  }
  if (shExpMatch(url, "*list.girlfrontline.co*") || shExpMatch(host, "sn-list.girlfrontline.co.kr")) {
      return "PROXY speedtest63120.synology.me:80";
//      return "PROXY 192.168.1.2:9000";
  }
  if (shExpMatch(host, "sn-list.txwy.tw"))
      return "PROXY 192.168.1.2:9000";
//    return "PROXY speedtest63120.synology.me:80";
  if (shExpMatch(host, "s3-ap-northeast-1.amazonaws.com") || shExpMatch(host, "mitm.it"))
    return "PROXY speedtest63120.synology.me:80";
  if (shExpMatch(host, "gfjp-transit.sunborngame.com"))
    return "PROXY speedtest63120.synology.me:80";

// Drony앱 사용자는 알리미에 연결하려면 "DIRECT"를 "PROXY 외부IP주소:포트"로 변경
// LTE를 통한 알리미연결은 포트 포워딩 또는 UPnP가 필요함
  if (shExpMatch(host, "*.girlfrontline.co.kr"))
    return "PROXY 192.168.1.2:9000";
  if (shExpMatch(host, "gf-adrgw-cn-zs-game-0001.ppgame.com"))
    return "PROXY 39.107.222.149:80";
  if (shExpMatch(host, "gf-adrbili-cn-zs-game-0001.ppgame.com"))
    return "PROXY 39.105.249.76:80";
//  if (shExpMatch(host, "adr.transit.gf.ppgame.com") || dnsDomainIs(host, "bili.adr.transit.gf.ppgame.com"))
//    return "PROXY 103.239.246.156:80";
  if (shExpMatch(host, "*.ppgame.com"))
    return "PROXY 192.168.1.2:9000";
  if (shExpMatch(host, "*.sunborngame.com"))
    return "PROXY 192.168.1.2:9000";
  if (shExpMatch(host, "*.txwy.tw"))
    return "PROXY 192.168.1.2:9000";
  return "PROXY 192.168.1.2:9000";
}