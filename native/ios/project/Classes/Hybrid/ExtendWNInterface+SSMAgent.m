//
//  ExtendWNInterface+SSMAgent.m
//  SKIMP_AppStore_M
//
//  Created by Sungoh Kang on 2021/06/21.
//

#import "ExtendWNInterface+SSMAgent.h"
#import "AppDelegate.h"

#define SSM_SERVER_INFO @"https://ssm-skimp.skinnovation.com:52444"
#define SSM_INFO @"U7684W3V9U"
#define SSM_COMPANY_ID @"SKI"

@implementation ExtendWNInterface (SSMAgent)

- (void)delegateInit {
    [[ExtSsmLib instance] setSsmServerInfo:SSM_SERVER_INFO];
    [[ExtSsmLib instance] setInfo:SSM_INFO];
    [[ExtSsmLib instance] delegate:self];
}
    
// SSM 설치 체크
- (void)exWNSSMInstallCheck:(NSString *)callbackNm {
    self.mCallbackName = callbackNm;
    [self delegateInit];
    [[ExtSsmLib instance] isInstalledSsmAgent:VALUE_TYPE_COMPANY_ID withValue:SSM_COMPANY_ID];
}

// SsmAgent, profile 설치 페이지 이동
- (void)exWNSSMInstallPageCall:(NSString *)installUrl {
    NSURL *url = [NSURL URLWithString:installUrl];
    if ([[UIApplication sharedApplication] canOpenURL:url]) {
        [[UIApplication sharedApplication] openURL:url
                                           options:@{}
                                 completionHandler:nil];
    } else {
        UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"알림"
                                                                                 message:@"설치 페이지가 존재하지 않습니다."
                                                                          preferredStyle:UIAlertControllerStyleAlert];
        UIAlertAction *confirmAction = [UIAlertAction actionWithTitle:@"확인"
                                                                style:UIAlertActionStyleDefault
                                                              handler:^(UIAlertAction * _Nonnull action) {
            
        }];
        
        [alertController addAction:confirmAction];
        [self.viewctrl presentViewController:alertController animated:YES completion:nil];
    }
}

// serialNumber 가져오기
- (NSString *)exWNGetSerialNum {
    self.mCallbackName = @"";
    [self delegateInit];
    NSString *serialNum = [[ExtSsmLib instance] getDeviceCertKey];
    NSLog(@"serialNum : %@", serialNum);
    return serialNum;
}

// SSM 서버 정보 가져오기
- (NSString *)exWNGetServerInfo {
    NSString *serverInfo = [[ExtSsmLib instance] getSsmAgentServerURL:SSM_INFO];
    return serverInfo;
}

// SSM 서버 실시간 등록대상 단말 등록/변경 API 사용할 parameter
- (NSString *)exWNGetSSMInfo {
    self.mCallbackName = @"";
    [self delegateInit];
    NSMutableDictionary *ssmInfoDic = [[NSMutableDictionary alloc] init];
    NSString *serialNum = [[ExtSsmLib instance] getDeviceCertKey];
    
    [ssmInfoDic setObject:@"" forKey:@"userId"];
    [ssmInfoDic setObject:@"00:00:00:00:00:00" forKey:@"mac"];
    [ssmInfoDic setObject:@"" forKey:@"imei"];
    [ssmInfoDic setObject:serialNum forKey:@"iosDeviceSerialNum"];
    [ssmInfoDic setObject:@"0" forKey:@"companyAsset"];
    
    return [ssmInfoDic jsonString];
}

// SSM 로그인
- (void)exWNSSMLogin:(NSString *)callbackNm {
    NSLog(@"exWNSSMLogin");
    self.mCallbackName = callbackNm;
    [self delegateInit];
    [[ExtSsmLib instance] ssmLogin];
}

// SSM 로그아웃
- (void)exWNSSMLogout:(NSString *)callbackNm {
    NSLog(@"exWNSSMLogin");
    self.mCallbackName = callbackNm;
    [self delegateInit];
    [[ExtSsmLib instance] ssmLogout];
}

// 탈옥여부 확인
- (NSString *)exWNSSMIsJailBroken {
    self.mCallbackName = @"";
    [self delegateInit];
    BOOL isJailBroken = [[ExtSsmLib instance] isJailBroken];
    
    if (isJailBroken) {
        return @"true";
    } else {
        return @"false";
    }
}

// 업무앱에서 로그인 상태인지에 대한 여부 (정책 적용 여부)
- (void)exWNSSMLoginStatusCheck:(NSString *)callbackNm {
    self.mCallbackName = callbackNm;
    [self delegateInit];
    [[ExtSsmLib instance] ssmLoginStatusCheck];
}

// SSM 인증여부를 확인하는 API
- (void)exWNCheckSSMAgent:(NSString *)callbackNm {
    self.mCallbackName = callbackNm;
    [self delegateInit];
    [[ExtSsmLib instance] checkSsmAgent:VALUE_TYPE_COMPANY_ID withValue:SSM_COMPANY_ID];
}

// 현재 설치된 ActivaionMDMProfile보다 최신 인증서가 포함된 ActivationMDMProfile이 있는지 확인한다.
// 해당 API의 결과 혹은 isInstalledSsmAgent(VALUE_TYPE)type withVaue:(NSString *)value API의 반환값의
// isNewMDMProfile 항목과 isNeedReInstall 항목을 확인하여 사용자에게 SSMAgent 앱을 재설치 유도하여야 한다.
- (NSString *)exWNCheckActivationMDMProfile {
    self.mCallbackName = @"";
    [self delegateInit];
    NSDictionary *checkActivationMDMProfileResult = [[ExtSsmLib instance] checkActivationMDMProfile];
    return [checkActivationMDMProfileResult jsonString];
}

// SSM 앱에 기기 정보를 요청하는 api
- (void)exWNReqSSMLoginData:(NSString *)schemeName :(NSString *)callbackNm {
    AppDelegate *appDelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
    appDelegate.schemeCallbackNm = callbackNm;
    BOOL isReqSSMLoginData = [[ExtSsmLib instance] reqSSMLoginData:schemeName];
    NSLog(@"isReqSSMLoginData : %@", isReqSSMLoginData ? @"YES" : @"NO");
}

// resSSMLoginData에서 시리얼이 정상 등록 되었는지 확인하는 API
-(NSString *)exWNChkSSMLoginData {
    BOOL isChkSSMLoginData = [[ExtSsmLib instance] chkSSMLoginData];
    NSLog(@"isChkSSMLoginData : %@", isChkSSMLoginData ? @"YES" : @"NO");
    
    return [NSString stringWithFormat:@"%@", isChkSSMLoginData ? @"true" : @"false"];
}

#pragma mark -
#pragma mark SSM Delegate

// SSM 성공 callback
- (void)didFinishSsmResponseSuccessCode:(SSM_SUCCESS_CODE)successCode withResult:(NSDictionary *)result {
    NSLog(@"didFinishSsmResponseSuccessCode : %i, result : %@", successCode, result);
    
    NSMutableDictionary *resultDic = [[NSMutableDictionary alloc] init];
    [resultDic setObject:[NSString stringWithFormat:@"%i", successCode] forKey:@"successCode"];
    [resultDic setObject:@"" forKey:@"errorCode"];
    [resultDic setObject:result forKey:@"resultData"];
    
    if (![self.mCallbackName isEqualToString:@""]) {
        [self.viewctrl callCbfunction:self.mCallbackName withObjects:resultDic, nil];
    }
}

// SSM 실패 callback
- (void)didFailSsmResponseErrorCode:(SSM_ERROR_CODE)errorCode withResult:(NSDictionary *)result {
    NSLog(@"didFailSsmResponseErrorCode : %i, result : %@", errorCode, result);
    
    NSMutableDictionary *resultDic = [[NSMutableDictionary alloc] init];
    [resultDic setObject:@"" forKey:@"successCode"];
    [resultDic setObject:[NSString stringWithFormat:@"%i", errorCode] forKey:@"errorCode"];
    [resultDic setObject:result forKey:@"resultData"];
    
    if (![self.mCallbackName isEqualToString:@""]) {
        [self.viewctrl callCbfunction:self.mCallbackName withObjects:resultDic, nil];
    }
}

@end
