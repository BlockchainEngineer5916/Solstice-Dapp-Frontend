import * as React from 'react' ;


import VideoToCanvas from '../Common/VideoToCanvas';
import ImageToCanvas from '../Common/ImageToCanvas';
import PdfPreview from '../Common/PdfPreview';
import DocxPreview from '../Common/DocxPreview';

import { Swiper, SwiperSlide } from "swiper/react/swiper-react";
import { EffectCube, Pagination } from "swiper";

import 'swiper/swiper.min.css';
import 'swiper/modules/effect-cube/effect-cube.min.css' ;

import {
    Box
} from '@mui/material' ;

import { useStyles } from './StylesDiv/Slider.styles';

const SolsSlider = (props) => {

    const classes = useStyles() ;

    const {
        sols
    } = props ;
    
    React.useEffect(() => {
        console.log(sols) ;
    }, [sols]) ;
    return (
        <Box className={classes.swiperDiv} >
            <Box sx={{position : 'absolute'}}>
                <Swiper
                   effect={"cube"}
                   grabCursor={true}
                   cubeEffect={{
                   slideShadows: true,
                   }}
                   pagination={true}
                   modules={[EffectCube, Pagination]}
                >
                    {
                        sols?.map((sol, index) => {
                            return (
                                <SwiperSlide key={index}>
                                    <>
                                        {
                                            sol?.category === 'video' ? <video src={sol.path} controls/>
                                            : sol?.category === 'image' ? <Box className={classes.slideDiv}>
                                                <img src={sol.path} width={'100%'} height={'100%'} />
                                            </Box>
                                            : sol?.category === 'pdf' ? <Box className={classes.slideDiv}>
                                                <PdfPreview
                                                    previewUrl={sol.path}
                                                    width={246}
                                                    height={296}
                                                /> 
                                                <Tooltip title={"Download " + sol.name}>
                                                    <Box className={classes.downloadDiv} onClick={() => handleDownloadSol(sol.path, sol.name+".pdf")}>
                                                        <img src={DownloadImage} width={30} height={30} />
                                                    </Box>
                                                </Tooltip>
                                            </Box>
                                            : new String("application/doc,application/docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document").search(sol.type) >=0 ?<Box className={classes.slideDiv} >
                                                <DocxPreview
                                                    previewUrl={sol.path}
                                                    width={246}
                                                    height={296}
                                                    key={uuidv4()}
                                                    activeIndex={index}
                                                    selfIndex={currentSol}
                                                    forceHide={openDocx}
                                                />
                                                <Tooltip title={"Download " + sol.name}>
                                                    <Box className={classes.downloadDiv} onClick={() => handleDownloadSol(sol.path, sol.name+".docx")}>
                                                        <img src={DownloadImage} width={30} height={30} />
                                                    </Box>
                                                </Tooltip>
                                            </Box>
                                            : <></>
                                        }
                                        {
                                            (
                                                sol?.category === 'image' || 
                                                sol?.category === 'pdf' ||
                                                sol?.category === 'vnd.openxmlformats-officedocument.wordprocessingml.document'
                                            ) &&
                                            <Box className={classes.fullIconDiv} onClick={() => {
                                                switch(sol?.category) {
                                                    case 'vnd.openxmlformats-officedocument.wordprocessingml.document' :
                                                        setOpenDocx(true);
                                                        setOpenDocxPath(sol.path) ;
                                                        return ;
                                                    case 'pdf' : 
                                                        setOpenPdf(true);
                                                        setOpenPdfPath(sol.path) ;
                                                        return ;
                                                    case 'image' :
                                                        setOpenImage(true) ;
                                                        setOpenImagePath(sol.path) ;
                                                        return ;
                                                    default :
                                                        return;
                                                }
                                            }}>
                                                <FullscreenIcon/>
                                            </Box>
                                        }
                                    </>
                                </SwiperSlide>
                            )
                        })
                    }
                </Swiper>
            </Box>
        </Box>
    )
}

export default SolsSlider ;