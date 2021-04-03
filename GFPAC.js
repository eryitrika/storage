function FindProxyForURL(url, host) {
    // 한섭 고화질 프록시 서버
    if (dnsDomainIs(host, "sn-list.girlfrontline.co.kr")) {
        return "PROXY klanet.iptime.org:9000";
    }
    // 중섭 고화질 프록시 서버
    else if (dnsDomainIs(host, "gf-cn.oss-cn-beijing.aliyuncs.com")) {
        return "PROXY klanet.iptime.org:9000";
    }
    return "PROXY 192.168.1.2:9000";
}