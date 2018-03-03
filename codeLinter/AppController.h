//
//  AppController.h
//  codeLinter
//
//  Created by 李嘉麒 on 2018/3/3.
//  Copyright © 2018年 李嘉麒. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Cocoa/Cocoa.h>

@interface AppController : NSObject {
@private
    
    IBOutlet NSTextField *fromFolderText;
    
    IBOutlet NSTextField *toFolderText;
    
}

- (IBAction)fromFolderButton:(id)sender;
- (IBAction)toFolderButton:(id)sender;
- (IBAction)runButton:(id)sender;




@end
