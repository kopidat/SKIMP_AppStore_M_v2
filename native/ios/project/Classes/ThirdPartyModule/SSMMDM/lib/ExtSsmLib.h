//
//  ExtSsmLib.h
//  ExtSsmLib
//
//  Created by park dong jun on 13. 10. 11..
//  Copyright (c) 2013 인포섹. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "SsmDelegate.h"

#define SSM_REQ_DEVICE_MDN              @"mdn"
#define SSM_REQ_DEVICE_IMEI             @"imei"
#define SSM_REQ_DEVICE_MAC              @"mac"
#define SSM_REQ_DEVICE_SERIAL_NUMBER    @"serialNumber"
#define SSM_REQ_DEVICE_ICCID            @"iccid"

@class ExtSsmManager;
@protocol SsmDelegate;

@interface DeviceInfoResponse : NSObject
@property(assign) int responseCode;
@property(nonatomic, retain) NSString *responseString;
@property(nonatomic, retain) NSString *key;
@property(nonatomic, retain) NSString *value;

- (id) initWithDictionary:(NSDictionary*)dictionary;

@end

@interface ExtSsmLib : NSObject {
    ExtSsmManager *extSsmMnr;
}

+ (ExtSsmLib *) instance;

/******************************************************************************************************************************************************************
 *************************************************************** SSM Basic, 페르소나 둘다 적용가능************************************************************
 ******************************************************************************************************************************************************************/
// Ssm 델리게이트(콜백) 설정
- (void) delegate:(id<SsmDelegate>)delegate;
// Ssm 서버 도메인 정보 설정
- (void) setSsmServerInfo:(NSString *)serverUrl;
// Ssm 설치 유무 확인 후 미설치시 ipa 경로  리턴 (서버통신)
- (void) isInstalledSsmAgent:(VALUE_TYPE)type withValue:(NSString *)value;
// Ssm 설치 유무만 체크
- (void)checkSsmAgent:(VALUE_TYPE)type withValue:(NSString *)value;
// 계열사에 맞는 Ssm 에이전트 설치 요청
- (void) installRecentSsm;
// 디바이스 탈옥 여부
- (BOOL) isJailBroken;
// Ssm 하드웨어 정보 (서버통신)
- (void) getDeviceInfo:(NSArray *)infoRequests;
// 키체인 공유시 사용 - 시리얼넘버, 맥정보 저장 ~ 키체인공유를 통해 디바이스 유일한 값을 가져온뒤 저장
- (void) setDeviceCertKey:(NSString *)certKey;
- (NSString *) getDeviceCertKey;
- (NSString *) getSsmAgentServerURL:(NSString *)teamId;;
- (NSMutableDictionary *) checkActivationMDMProfile;

/******************************************************************************************************************************************************************
 ************************************************************************ SSM Basic 사용 시*********************************************************************
 ******************************************************************************************************************************************************************/
// Ssm 프로파일 삭제 유무 및 인증확인 후 정책적용 (서버통신)
- (void) ssmLogin;
// 연동 앱 종료시 호출 후 정책적용 (서버통신)
- (void) ssmLogout;
// Ssm 하드웨어 컨트롤 (서버통신) - 사용안함
- (void) controllHwType:(HW_TYPE)type withOption:(BOOL)onOff;
// URL Scheme을 이용한 기기정보 전달
- (Boolean) reqSSMLoginData:(NSString *)retrunScheme;
// URL Scheme을 이용한 기기정보 전달
- (Boolean) resSSMLoginData:(NSURL *)launchUrl teamid:(NSString *)value;
// URL Scheme을 이용한 기기정보 전달
- (Boolean) chkSSMLoginData;

/******************************************************************************************************************************************************************
 ************************************************************************** 페르소나 사용 시***********************************************************************
 ******************************************************************************************************************************************************************/
//- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation 에 적용
- (void) notifyPersona;
//- (void)applicationDidBecomeActive:(UIApplication *)application 에 적용
// 미설치시 에러 콜백함수로 리턴
- (void) checkPersonaWithUrlscheme:(NSString *)urlscheme withType:(VALUE_TYPE)type withValue:(NSString *)value;
// 미설치시 앱 종료  됨
- (void) checkPersona:(NSString *)urlscheme;
//- (void)applicationWillResignActive:(UIApplication *)application 에 적용
- (void) resignActivePersona;
// Ssm 정보를 따로 파일로 저장(맥, 팀아이디, 시리얼넘버)
- (void) setInfo:(NSString *)teamId;
//각 현재 상태 체크
- (BOOL)checkStatus:(VALUE_TYPE)type withValue:(NSString *)value;
//로그인 상태 체크
- (void) ssmLoginStatusCheck;


@end
