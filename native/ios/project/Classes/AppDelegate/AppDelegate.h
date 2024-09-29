//
//  AppDelegate.h
//

#import <UIKit/UIKit.h>
#import "ExtSsmLib.h"

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow *window;
@property (assign, nonatomic) BOOL isAppStart;
@property (strong, nonatomic) NSString *schemeCallbackNm;

@end
