#import "BuildConfig.h"

@implementation BuildConfig

RCT_EXPORT_MODULE()

-(NSDictionary *)constantsToExport {
  NSString *shortVersionString = [[NSBundle mainBundle] objectForInfoDictionaryKey: @"CFBundleShortVersionString"];
    return @{
        @"FLAVOR": @"",
        @"VERSION_NAME": shortVersionString
    };
}

+(BOOL)requiresMainQueueSetup {
  return NO;
}

@end
