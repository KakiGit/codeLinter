#include "stdio.h"
#include "imageProcessFunc.c"
#include "math.h"
#include "test.c"
#define F_PATH "/Users/lijiaqi/Desktop/ha/hap6.ppm"
unsigned char asciiToBinary(unsigned char c); 

int main(int argc, const char *argv[])
{
    int aCounter=0;
    unsigned char c;
    int sizeX=0,sizeY=0,maxBrightness=0;
    FILE *fp = NULL; //需要注意
    fp = fopen(F_PATH, "rb");
    if (NULL == fp)
        return -1; //要返回错误代码
    while(aCounter<3)
    {
        
        if(aCounter==1){
            int power=1;       
            for (int i = 0; i < 2; i++)
            {
                fscanf(fp, "%c", &c);
                // printf("sizeX's c: %x ",c);
                sizeX = sizeX + asciiToBinary(c) * pow(10, power);
                power--;
                // printf("in sizeX");
            }
            power = 1;
            fscanf(fp, "%c", &c);
            for (int i = 0; i < 2; i++)
            {
                fscanf(fp, "%c", &c);
                // printf("sizeY's c:%x ", c);
                sizeY = sizeY + asciiToBinary(c) * pow(10, power);
                power--;
                // printf("in sizeY");
            }
        }
        fscanf(fp, "%c", &c);
        // printf("%x ", c);
        if(c=='\n')
        aCounter++;
        // printf("aCounter: %d ", aCounter);
    }
    // fclose(fp);
    // printf("hello");
    // printf("sizeX: %d,sizeY: %d",sizeX,sizeY);

    unsigned char img[ sizeX * sizeY * 3 + 3];
    unsigned char *cp;
    cp = img;
    *cp++ = sizeX;
    *cp++ = sizeY;
    *cp++ = 255;
    while (fscanf(fp, "%c", &c) != EOF)
    *cp++ = c ;
        // printf("%c", c); //从文本中读入并在控制台打印出来
    fclose(fp);
    fp = NULL; //需要指向空，否则会指向原打开文件地址
    // cp = &img[13];
    // unsigned char *newcp=img;
    // *newcp++ = 100;
    // *newcp++ = 100;
    // *newcp++ = 255;
    // for(int i=0;i<7500;i++)
    // *newcp++ = *cp++;
    // cp = img;
    // for(int i = 0; i<7503;i++)
    // printf("%d,",*cp++);
    cp = img;
    rgbToGray(cp);

    return 0;
}

unsigned char asciiToBinary (unsigned char c) {
    unsigned char ascii[11] = {'0','1','2','3','4','5','6','7','8','9','P'};
    for(int i=0;i<11;i++)
    {
        if(c==ascii[i])
        return i;
    }
    return -1;
}