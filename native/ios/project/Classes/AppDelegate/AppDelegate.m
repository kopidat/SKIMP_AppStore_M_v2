//
//  AppDelegate.m
//

#import "AppDelegate.h"
#import "PushReceiver.h"
#import <MPush/PushManager.h>
#import <MPush/AppDelegate+PushManager.h>
#import "ExtSsmLib.h"

@interface AppDelegate ()

@property (strong, nonatomic) PPNavigationController *navigationController;

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    
    // 로컬서버 끄기 (크로스도메인 오류때문에 사용)
    _setStorageValue(NO_LOCAL_SERVER, @"true");
    
    self.isAppStart = YES;
    
    window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    navigationController = [MAppDelegate initialViewControllerWithLaunchOptions:launchOptions];
    
    [window setBackgroundColor:[UIColor blackColor]];
    [window setRootViewController:navigationController];
    [window makeKeyAndVisible];
    
    [[PushManager defaultManager] application:application didFinishLaunchingWithOptions:launchOptions];
    [[PushManager defaultManager] initilaizeWithDelegate:[[PushReceiver alloc] init]];
    
    return YES;
}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    NSLog(@"url %@",url);
//    NSString * urlComponent = [url absoluteString];
    NSURLComponents *urlComponents = [NSURLComponents componentsWithURL:url resolvingAgainstBaseURL:NO];
    
    NSLog(@"absoluteString : %@", [urlComponents string]);
    NSLog(@"urlScheme : %@", [urlComponents scheme]);
    NSLog(@"urlHost : %@", [urlComponents host]);
    NSLog(@"query : %@", [urlComponents query]);
    NSLog(@"query item : %@", [urlComponents queryItems]);
    
    if ([[urlComponents scheme] isEqualToString:@"SKIMemberStore"]) {
        if ([[urlComponents host] isEqualToString:@"LOGIN"]) {
            NSMutableDictionary *queryDic = [[NSMutableDictionary alloc] init];
            for (NSURLQueryItem *queryItem in [urlComponents queryItems]) {
                [queryDic setObject:[queryItem value] forKey:[queryItem name]];
            }
            NSLog(@"queryDic : %@", queryDic);
            NSString *appName = [queryDic objectForKey:@"appName"];
            
            if (self.isAppStart) {
                NSMutableDictionary *storeOpenInfoDic = [[NSMutableDictionary alloc] init];
                [storeOpenInfoDic setObject:appName forKey:@"appName"];
                [storeOpenInfoDic setObject:@"LOGIN" forKey:@"type"];
                _setGlobalValue(@"storeOpenInfo", [storeOpenInfoDic jsonString]);
            } else {
                PPWebViewController *current = (PPWebViewController *)navigationController.currentViewCtrl;
                [current callCbfunction:@"fn_storeopen" withObjects:appName, @"LOGIN", nil];
            }
            
        } else if ([[urlComponents host] isEqualToString:@"UPDATE"]) {
            NSMutableDictionary *queryDic = [[NSMutableDictionary alloc] init];
            for (NSURLQueryItem *queryItem in [urlComponents queryItems]) {
                [queryDic setObject:[queryItem value] forKey:[queryItem name]];
            }
            NSLog(@"queryDic : %@", queryDic);
            NSString *appName = [queryDic objectForKey:@"appName"];
            
            if (self.isAppStart) {
                NSMutableDictionary *storeOpenInfoDic = [[NSMutableDictionary alloc] init];
                [storeOpenInfoDic setObject:appName forKey:@"appName"];
                [storeOpenInfoDic setObject:@"UPDATE" forKey:@"type"];
                _setGlobalValue(@"storeOpenInfo", [storeOpenInfoDic jsonString]);
            } else {
                PPWebViewController *current = (PPWebViewController *)navigationController.currentViewCtrl;
                [current callCbfunction:@"fn_storeopen" withObjects:appName, @"UPDATE", nil];
            }
        }
    } else if ([[urlComponents scheme] isEqualToString:@"SKMemberStore-SSM"]) {
        BOOL isResSSMLoginData = [[ExtSsmLib instance] resSSMLoginData:url teamid:@"U7684W3V9U"];
        NSLog(@"isResSSMLoginData : %@", isResSSMLoginData ? @"YES" : @"NO");
        
        PPWebViewController *current = (PPWebViewController *)navigationController.currentViewCtrl;
        [current callCbfunction:self.schemeCallbackNm withObjects:[NSString stringWithFormat:@"%@", isResSSMLoginData ? @"true" : @"false"], nil];
    }
    
    return NO;
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    self.isAppStart = NO;
}

@synthesize window, navigationController;

@end
