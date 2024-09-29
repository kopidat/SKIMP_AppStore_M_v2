//
//  ExtendWNInterface.h
//

#import <UIKit/UIKit.h>

@interface ExtendWNInterface : NSObject<WNInterface>

@property (nonatomic, readonly) PPWebViewController *viewController;
@property (nonatomic, assign) PPWebViewController *viewctrl;

@property (nonatomic, strong) NSString *mCallbackName;

@end
