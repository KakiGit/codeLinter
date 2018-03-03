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
}
@end
