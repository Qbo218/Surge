/*
Bilibli番剧，自动切换地区

此脚本仅适用于Surge4.0+ (iOS)
此脚本仅适用于Surge4.0+ (iOS)
此脚本仅适用于Surge4.0+ (iOS)

您需要配置相关规则集（https://raw.githubusercontent.com/DivineEngine/Profiles/master/Surge/Ruleset/StreamingMedia/StreamingSE.list）绑定相关select策略组，并且需要具有相关的区域代理服务器纳入您的子策略中。
最后，您可以通过BoxJs设置策略名和子策略名，或者手动填入脚本。

Update: 2021.02.07
Author: @NobyDa

****************************
Surge 4.2+ 远程脚本配置 :
****************************
[Script]
Bili Region = type=http-response,pattern=^https:\/\/ap(p|i)\.bilibili\.com\/(pgc\/view\/(v\d\/)?app|x(\/v\d)?\/view\/video)\/(season|online)\?access_key,requires-body=1,max-size=0,control-api=1,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/Bili_Auto_Regions.js

[MITM]
hostname = ap?.bilibili.com
****************************
*/

const Group = $persistentStore.read('BiliArea_Policy') || '策略：港台媒体'; //Your blibli policy group name.
const CN = $persistentStore.read('指定：直接连接') || 'DIRECT'; //Your China sub-policy name.
const TW = $persistentStore.read('可用：台新节点') || '🇹🇼 sub-policy'; //Your Taiwan sub-policy name.
const HK = $persistentStore.read('可用：香港节点') || '🇭🇰 sub-policy'; //Your HongKong sub-policy name.

var obj = JSON.parse($response.body),
	obj = (obj.result || obj.data || {}).title || '';
const current = $surge.selectGroupDetails().decisions[Group] || 'Policy error ⚠️'
const str = (() => {
	if (obj.match(/\u50c5[\u4e00-\u9fa5]+\u6e2f/)) {
		if (current != HK) return HK;
	} else if (obj.match(/\u50c5[\u4e00-\u9fa5]+\u53f0/)) {
		if (current != TW) return TW;
	} else if (current != CN) return CN;
})()

if (str) {
	const change = $surge.setSelectGroupPolicy(Group, str);
	const notify = $persistentStore.read('BiliAreaNotify') === 'true';
	if (!notify) $notification.post(obj, ``, `${current}  =>  ${str}  =>  ${change?`🟢`:`🔴`}`);
	if (change) {
		$done(); //Kill the connection. Due to the characteristics of Surge, it will auto reconnect with the new policy.
	} else {
		$done({});
	}
} else {
	$done({});
}
