//
//  AppController.m
//  codeLinter
//
//  Created by 李嘉麒 on 2018/3/3.
//  Copyright © 2018年 李嘉麒. All rights reserved.
//

#import "AppController.h"

@implementation AppController

- (void)awakeFromNib {
    [fromFolderText setStringValue:@"From folder ..."];
    [toFolderText setStringValue:@"To folder ..."];
}



- (IBAction)fromFolderButton:(id)sender {
    NSOpenPanel *panel = [NSOpenPanel openPanel];
    [panel setMessage:@"Select a folder"];
    [panel setCanChooseDirectories:YES];
    [panel setCanCreateDirectories:YES];
    [panel setCanChooseFiles:NO];
    NSString *path_all;
    NSInteger result = [panel runModal];
    if (result == NSModalResponseOK)
    {
        path_all = [[panel URL] path];
        [fromFolderText setStringValue:path_all];
    }
    
}

- (IBAction)toFolderButton:(id)sender {
    NSOpenPanel *panel = [NSOpenPanel openPanel];
    [panel setMessage:@"Select a folder"];
    [panel setCanChooseDirectories:YES];
    [panel setCanCreateDirectories:YES];
    [panel setCanChooseFiles:NO];
    NSString *path_all;
    NSInteger result = [panel runModal];
    if (result == NSModalResponseOK)
    {
        path_all = [[panel URL] path];
        [toFolderText setStringValue:path_all];
    }
}

- (IBAction)runButton:(id)sender {
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSString *fromPath =[fromFolderText stringValue];
    NSString *targetPath = [toFolderText stringValue];
    NSURL * url = [NSURL URLWithString:fromPath];
    
    NSMutableArray* arrayToCopy = [NSMutableArray new];
    
    
    NSArray *pros = [NSArray arrayWithObjects:NSURLNameKey,nil];
    NSArray *files = [fileManager contentsOfDirectoryAtURL:url includingPropertiesForKeys:pros options:NSDirectoryEnumerationSkipsHiddenFiles error:nil];
    //(推荐使用)subpathsOfDirectoryAtPath 不是使用递归的方式获取的
//    NSArray *subPaths = [fileManager subpathsAtPath:fromPath];
//    subPaths = [fileManager subpathsOfDirectoryAtPath:fromPath error:nil];
//    NSLog(@"subPaths = %@",subPaths);
    
    for(NSURL* fileURL in files)
    {
        NSRange range = [[fileURL path] rangeOfString:@"." options:NSBackwardsSearch];
        
        if (range.location != NSNotFound)
        {
            NSString* postfix = [[[fileURL path] substringFromIndex:range.location] lowercaseString];
            NSString *temp = nil;
            if ([@".js" rangeOfString:postfix].location != NSNotFound)
            {
                
                temp =@".js";
                [arrayToCopy addObject:fileURL];
            }
        }
    }
    for(NSURL* fileURL in arrayToCopy)
    {
        NSString *str1 = [[fileURL path] lastPathComponent];
        NSString *astring = [NSString stringWithFormat:@"%@/%@",targetPath,str1];
        [fileManager copyItemAtPath:[fileURL path] toPath:astring error:nil];
    }
//    NSLog(@".js files %@",targetPath);
   
//     NSLog(@"copied file name %@",astring);
    NSString *augument = [NSString stringWithFormat:@"%@/*.js",targetPath];
    NSLog(@"standard argument path %@",augument);
    
    int pid = [[NSProcessInfo processInfo] processIdentifier];
    NSPipe *pipe = [NSPipe pipe];
    NSFileHandle *file = pipe.fileHandleForReading;

    NSTask *task = [[NSTask alloc] init];
    task.launchPath = @"/usr/local/bin/node";
    task.arguments = @[@"/usr/local/lib/node_modules/standard/bin/cmd.js", augument, @"--fix"];
    task.standardOutput = pipe;

    [task launch];

    NSData *data = [file readDataToEndOfFile];
    [file closeFile];

    NSString *grepOutput = [[NSString alloc] initWithData: data encoding: NSUTF8StringEncoding];
    NSLog (@"grep returned:\n%@", grepOutput);
    
}
@end
