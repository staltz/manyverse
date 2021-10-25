// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

#import "BuildConfig.h"

@implementation BuildConfig

RCT_EXPORT_MODULE()

// TODO: delete this .h and .m from XCode
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
