function FindProxyForURL(url, host) {
  if (shExpMatch(host, "oss-rescnf.gf.ppgame.com") || dnsDomainIs(host, "oss-rescnf.gf.ppgame.com")) {
      return "PROXY speedtest63120.synology.me:80"; 
  }
/*  if (shExpMatch(url, "*list.girlfrontline.co*") || shExpMatch(host, "sn-list.girlfrontline.co.kr")) {
      return "PROXY speedtest63120.synology.me:80";
  } */
/*  if (shExpMatch(host, "sn-list.txwy.tw"))
      return {0}; */
  if (shExpMatch(host, "s3-ap-northeast-1.amazonaws.com") || shExpMatch(host, "mitm.it") || shExpMatch(host, "gf-cn.oss-cn-beijing.aliyuncs.com"))
    return "PROXY speedtest63120.synology.me:80";
  if (shExpMatch(host, "gfjp-transit.sunborngame.com"))
    return "PROXY speedtest63120.synology.me:80";
  if (shExpMatch(host, "gf-cn.cdn.sunborngame.com"))
    return "PROXY speedtest63120.synology.me:404";
/*  if (shExpMatch(host, "*.girlfrontline.co.kr"))
    return {0}; */
  if (shExpMatch(host, "gf-adrbili-cn-zs-game-0001.ppgame.com"))
    return "PROXY 39.105.249.76:80";
  if (shExpMatch(host, "gfcn-transit.gw.sunborngame.com") || dnsDomainIs(host, "bili.adr.transit.gf.ppgame.com"))
    return "PROXY speedtest63120.synology.me:80";
  if (shExpMatch(host, "*.ppgame.com"))
    return {0};
  if (shExpMatch(host, "*.sunborngame.com"))
    return {0};
/*  if (shExpMatch(host, "*.txwy.tw"))
    return {0}; */
  return "DIRECT";
}
