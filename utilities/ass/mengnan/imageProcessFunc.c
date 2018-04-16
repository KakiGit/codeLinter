
#include<stdio.h>
#include<3-1.c>
#include<3-2.c>
// #include <math.h>
void printAscii();
void rgbToGray();
void resizeImg();
void sobel();
void brightCorrect();

// ^(?!((\/\/)|(\/\*)|(\*\/)))(?=((((\/\/)|(\/\*)|(\*\/)|(\*))+\s*)*))[a-z]+[0-9a-zA-Z]*(?=(\s*\())

// (?!((((\/\/)|(\/\*)|(\*\/))+)))[a-z]+[0-9a-zA-Z]*(?=(\s*\())

// (((((\/\/)|(\/\*)|(\*\/)|(\*))+\s*)*))[a-z]+[0-9a-zA-Z]*(?=(\s*\())
void printAscii(unsigned char* img)
{
	unsigned char* tmpP = &img[3];
	unsigned char* imgP = img;
	int sizeX = *img++, sizeY = *img++,i,j;
	int sizeImg = sizeX * sizeY;
	unsigned char symbols[16] = {64,103,82,98,119,86,117,106,40,73,116,115,42,59,46,32};
	*imgP++ = sizeX ;
	*imgP++ = sizeY ;
	*imgP++ = *img++;

for(i = sizeImg - 1; i >= 0 ; i--)
{
	*imgP++ = symbols[((*imgP)>>4)];
}
imgP = tmpP;
// img = tmpP;
for(i = sizeY - 1; i >= 0; i--)
	{
	for(j = sizeX - 1; j >= 0 ; j--)
		{
		putchar(*imgP++);
		putchar(' ');
		}
	printf("\n");
	}
}



void rgbToGray(unsigned char* base)
{
int sizeX = *base++;
int sizeY = *base++;
int sizeImg = sizeX * sizeY;
unsigned char grayscale_img[ sizeX * sizeY + 3 ];
unsigned char* imgP = grayscale_img;

    *imgP++ = sizeX;
	*imgP++ = sizeY;
	*imgP++ = *base++;

for(int i = 0; i < sizeImg; i++)
{
	*imgP++ =    ((*base)>>4)+ ((*base++)>>2) +
                 ((*base)>>4) + ((*base++)>>1)  
                + ((*base++)>>3);
}
imgP = grayscale_img;
// for(int i=0;i<sizeY;i++) {
// 		for(int j=0;j<sizeX;j++) {
// 			printf("%d	",grayscale_img[ i * sizeX + j + 3 ]);
// 		}
// 		printf("\n");
// 	}


// printf("grayscale done\n");
// printAscii(imgP);
resizeImg(imgP);
// sobel(imgP);
// brightCorrect(imgP);

}


void resizeImg(unsigned char* base) {
	int sizeX = base[0];
	int sizeY = base[1];
	int sizeXAfResize = sizeX>>1,sizeYAfResize = sizeY>>1;
	int sizeImg = sizeX * sizeY>>2;
	unsigned char impImg[sizeImg+3];
	impImg[0] = sizeXAfResize;
	impImg[1] = sizeYAfResize;
	impImg[2] = base[2] ;
	// printf("sizex after resize %d ",impImg[0]);
	// printf("sizey after resize %d \n",impImg[1]);
	
	for(int i=0;i<sizeYAfResize;i++) {
		for(int j=0;j<sizeXAfResize;j++) {
			impImg[i * sizeXAfResize + j + 3] = (base[2 * i * sizeX + 2 * j + 3] + base[2 * i * sizeX + 2 * j + 1 + 3]
								  + base[(2 * i + 1) * sizeX  + 2 * j+3] + base[(2 * i + 1) * sizeX  + 2 * j + 1 + 3])/4;
			// printf("%d ", base[2 * i * sizeX + 2 * j + 3]);
		}
		// printf("\n");
	}
	// for(int i=0;i<sizeYAfResize;i++) {
	// 	for(int j=0;j<sizeXAfResize;j++) {
	// 		printf("%d	", impImg[ i * sizeXAfResize + j + 3 ]);
	// 	}
	// 	printf("\n");
	// }
	
	// printf("resieze done\n");
	// printAscii(impImg);
	// sobel(impImg);
	brightCorrect(impImg);
}

void brightCorrect(unsigned char* img) {
	unsigned char bmax=0,bmin=255,sig=1;
	unsigned char sizeX = img[0],sizeY = img[1];
	unsigned char imgBri[sizeX*sizeY+3];
	imgBri[0]=sizeX;
	imgBri[1]=sizeY;
	imgBri[2]=img[2];
	for(int i=0;i<sizeY*sizeX;i++) {
			imgBri[i+3] = img[i+3];
		}
	for(int i=0;i<sizeX*sizeY;i++)
	{
		if(imgBri[i+3]>bmax)
			bmax=imgBri[i+3];
		if(imgBri[i+3]<bmin)
			bmin=imgBri[i+3];
	}
	// printf("bmax = %d , bmin = %d \n",bmax,bmin);
	while(sig==1)
	{
	for(int i=0;i<sizeX*sizeY;i++)
		{
			unsigned char tmp;
			tmp = imgBri[i+3]-bmin;
			if(bmax-bmin>127)
				// tmp = imgBri[i+3];
				imgBri[i+3]=imgBri[i+3];//useless
				else if(bmax-bmin>63)
					imgBri[i+3] = tmp * 2;
					else if(bmax-bmin>31)
						imgBri[i+3] = tmp * 4;
						else if(bmax-bmin>15)
						imgBri[i+3] = tmp * 8;
						else
						imgBri[i+3] = tmp * 16;
		}
		for(int i=0;i<sizeX*sizeY;i++)
		{
		if(imgBri[i+3]>bmax)
			bmax=imgBri[i+3];
		if(imgBri[i+3]<bmin)
			bmin=imgBri[i+3];
		}
		// printf("bmax = %d , bmin = %d \n",bmax,bmin);
	if(bmax-bmin>127)
		sig = 0;
	}
	// for(int i=0;i<sizeY;i++) {
	// 	for(int j=0;j<sizeY;j++) {
	// 		printf("%d	", imgBri[i+3]);
	// 	}
	// 	printf("\n");
	// }
	printAscii(imgBri);
	// sobel(imgBri);
}

void sobel (unsigned char* base) {
	unsigned char sizeX = base[0];
	unsigned char sizeY = base[1];
	unsigned char sizeXAfSobel = sizeX - 2,sizeYAfSobel = sizeY - 2;
	unsigned char imgSobel[sizeXAfSobel*sizeYAfSobel+3];
	unsigned char* imgP = imgSobel;
	// imgSobel[0] = sizeXAfSobel;
	// imgSobel[1] = sizeYAfSobel;
	// imgSobel[2] = base[2];
	*imgP++ = sizeXAfSobel;
	*imgP++ = sizeYAfSobel;
	*imgP++ = base[2];
	unsigned char* tmpP = &base[3];
	for(int i = 0 ; i < sizeYAfSobel ; i++)
	{	
		for(int j = 0 ; j < sizeXAfSobel ; j++)
		{
			
			int xm1ym1,xym1,xp1ym1,
				xm1y       ,xp1y,
				xm1yp1,xyp1,xp1yp1;
			int gx,gy,g1;
			unsigned char g;
			

				xm1ym1=*tmpP++;
				xym1= *tmpP++;
				xp1ym1= *tmpP;
				tmpP = tmpP + sizeX - 2;
				xm1y= *tmpP++;
				*tmpP++;
				// xy= base[i*sizeX+j]; //pixel in the middle
				xp1y= *tmpP;
				tmpP = tmpP + sizeX - 2;
				xm1yp1= *tmpP++;
				xyp1= *tmpP++;
				xp1yp1= *tmpP;

				gx = xm1ym1 + (xm1y>>1) + xm1yp1 - (xp1yp1 + (xp1y>>1) + xp1ym1);
				gy = xp1ym1 + (xym1>>1) + xm1ym1 - (xp1yp1 + (xyp1>>1) + xm1yp1);
				//problem

				// g  = sqrt_16( gx * gx + gy * gy );
				g = (abs(gx) + abs(gy))>>2;
				// g =  sqrt( gx * gx + gy * gy );
				if(g>255)
				g=255;
				// g = sqrt_( gx * gx + gy * gy );
				// g  = SquareRootFloat( gx * gx + gy * gy );
				// printf("%u ",g);
				// printf("%u ",g);
				*imgP++ = g;	
				tmpP = tmpP - 2 * sizeX - 1;
		}
		/*
		 *
		 */
		tmpP = tmpP + 2;
	}
	printf("\n");
	
	imgP = imgSobel;
	// resizeImg(imgSobel);
	printAscii(imgP);
}
