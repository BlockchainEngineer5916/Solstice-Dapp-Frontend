import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
    root : {
        "& .swiper" : {
            width : '270px !important', height : '400px !important',
        },
        "& .swiper-slide" : {
            background : 'rgba(51, 139, 239, 0.21) !important',
            borderRadius : '10px',
            width : '270px !important', height : '400px !important',
            position : 'relative' ,
            "& video" : {
                background : 'linear-gradient(135deg, #e52d65 0%, #629df6 53.09%, #3c1d9d 100%) !important',
                borderRadius : '10px',
            }
        },
    },
    swiperDiv : {
        display : 'flex', justifyContent : 'center', alignItems : 'center',
        position : 'relative',
        overflowX : 'hidden',
        overflowY : 'hidden',
        height: '330px !important',
    },
}))