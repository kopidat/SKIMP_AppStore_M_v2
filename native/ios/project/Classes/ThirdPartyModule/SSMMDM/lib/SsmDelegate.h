//
//  SsmDelegate.h
//  SsmCallback
//
//  Created by park dong jun on 13. 10. 11..
//  Copyright (c) 2013 인포섹. All rights reserved.
//

#import <Foundation/Foundation.h>

// didFinishSsmResponseSuccessCodeWithResult 콜백에서 기능 구분
typedef enum SSM_SUCCESS_CODE {
    SSM_SUCCESS_CODE_LOGIN = 1,             // Ssm 로그인
    SSM_SUCCESS_CODE_SCREEN_CAPTURE = 2,    // 캡쳐 제어
    SSM_SUCCESS_CODE_CAMERA = 3,            // 카메라 제어
    SSM_SUCCESS_CODE_DEVICE_INFO = 4,       // 단말 H/W 정보 조회
    SSM_SUCCESS_CODE_LOGOUT = 5,            // Ssm 로그아웃
    SSM_SUCCESS_CODE_EXIST_AGENT = 6,       // SsmAgent 설치 확인
    SSM_SUCCESS_CODE_CHECK_SSM = 7,         //SsmAgent check
    SSM_SUCCESS_CODE_POLICY_STATUS = 8,     //업무앱에서 정책 적용 status
} SSM_SUCCESS_CODE;

// didFailSsmResponseErrorCodeWithResult 콜백에서 에러구분
typedef enum SSM_ERROR_CODE {
    SSM_ERROR_CODE_UNKNOWN_EXCEPTION = -1,  // 알수 없는 오류
    SSM_ERROR_CODE_TIME_OUT = 0,            // 통신 timeout 오류
    SSM_ERROR_CODE_NOT_SERVER_INFO = 1,     // 서버정보 미설정 오류
    SSM_ERROR_CODE_NOT_EXIST_AGENT = 2 ,    // SsmAgent 미설치 오류
    SSM_ERROR_CODE_NOT_MDM_PROFILE = 3,     // MDM프로파일 삭제시 오류
    SSM_ERROR_CODE_EXIST_SSM2 = 4,          // SSM2.0이 설치되어 있는 오류
    SSM_ERROR_CODE_EXIST_SSM4 = 5,          // SSM4.0 SSM서버로부터 배포되지 않은 앱이 설치되어있는 오류
    SSM_ERROR_CODE_CHECK_SSM = 6,           //SsmAgent check
    SSM_ERROR_CODE_POLICY_STATUS = 7,       //업무앱에서 정책 적용 status
    SSM_ERROR_CODE_EXPIRED_PROFILE = 8,       //이전 프로파일 사용중
} SSM_ERROR_CODE;

// controllHwType 메서드 타입
typedef enum SSM_HARDWARE_TYPE {
    HW_TYPE_SCREEN_CAPTURE = 1,     // 화면캡쳐
    HW_TYPE_CAMERA,                 // 카메라
} HW_TYPE;

// IsInstalledSsmAgent 메서드 호출시 valueType
typedef enum SSM_VALUE_TYPE {
    VALUE_TYPE_NONE = 0,        // 사용안함
    VALUE_TYPE_COMPANY_ID,      // 계열사 ID
    VALUE_TYPE_COMPANY_HPHONE,  // 핸드폰번호
} VALUE_TYPE;

typedef enum TIMEOUT_NETWORK_ERROR_TYPE {
    ConnectionFailureErrorType = 1,
    RequestTimedOutErrorType = 2,
    AuthenticationErrorType = 3,
    RequestCancelledErrorType = 4,
    UnableToCreateRequestErrorType = 5,
    InternalErrorWhileBuildingRequestType  = 6,
    InternalErrorWhileApplyingCredentialsType  = 7,
	FileManagementError = 8,
	TooMuchRedirectionErrorType = 9,
	UnhandledExceptionError = 10,
	CompressionError = 11
} NETWORK_ERROR_TYPE;

@protocol SsmDelegate
@required
// 정상 처리
- (void) didFinishSsmResponseSuccessCode:(SSM_SUCCESS_CODE)successCode withResult:(NSDictionary *)result;
// 네트워크 오류 및 서버 오류로 인한 실패
- (void) didFailSsmResponseErrorCode:(SSM_ERROR_CODE)errorCode withResult:(NSDictionary *)result;
@end
