import { makeStyles } from "@mui/styles";

// Montserrat
export const useStyles = makeStyles((theme) => ({
    root : {
        backgroundColor : theme.palette.blue.main,
        position : 'relative',
        width : '100vw',
        minHeight : '100vh',

        paddingTop : 30,
        paddingBottom : 30,

        color : theme.palette.green.G200,

        display : 'flex', alignItems : 'center', justifyContent : 'center',
    },
    greenBlur : {
        position : 'absolute', left: 45,  top: 170,
        width: 200,  height: 150,
        background: '#43D9AD',
        opacity: '0.35',
        filter: 'blur(55px)',
        transform: 'rotate(-140.38deg)'
    },
    blueBlur : {
        position : 'absolute', right: 45,  top: 450,
        width: 200, height: 150,
        background: '#4D5BCE',
        opacity: '0.35',
        filter: 'blur(55px)',
        transform: 'rotate(-140.38deg)'
    },
    fullIconDiv : {
        position : 'absolute !important',
        zIndex : 5554,

        right : 20, bottom : 20,

        borderRadius : '50%',   
        border  : '1px solid ' + theme.palette.green.G200,

        width : 30, height : 30,
        display : 'flex', alignItems : 'center', justifyContent : 'center',
        
        "&:hover" : {
            background : "#2f626ab0",
            boxShadow : '0px 0px 15px #eee'
        },

        cursor : 'pointer',
        
        transition : '0.2s',

        "& svg" : {
            color : theme.palette.green.G200,
            fontSize : 30
        }
    },
    productDiv : {
        border : '1px solid ' + theme.palette.green.G200,
        padding : 20,
        borderRadius : 20,
        
        width : '70% !important',

        ['@media (max-width : 1215px)'] : {
            width : '80% !important'
        },
        ['@media (max-width : 1030px)'] : {
            width : '90% !important'
        }
    },
    watchDiv :{
        position : 'relative',

        display : 'flex',
        alignItems : 'center',
        justifyContent : 'center',

        border : '1px solid ' + theme.palette.blue.B100,
        borderRadius : 10,
        overflow : 'hidden',
    },
    infoDiv : {
        paddingLeft : 40,
        width : '100%',
        height : '100%',
        ['@media (max-width : 850px)'] : {
            height : 400,
            paddingLeft : 0
        },
        display : 'flex', justifyContent : 'space-between',  flexDirection : 'column'
    },
    buttonCss2 : {
        height : 50,
        width : 160,
         
        backgroundImage: 'linear-gradient(to right, #4776E6 0%, #8E54E9  51%, #4776E6  100%)',
        textAlign: 'center',
        textTransform: 'capitalize !important',
        transition: '0.5s !important',
        backgroundSize: '200% auto !important',
        color: 'white !important',          
        boxShadow: '0 0 20px #eee !important',
        borderRadius: '30px !important',
        padding : '10px 10px !important',
        fontSize : '17px !important', fontWeight : 'bold !important',
 
        "&:hover" : {
            backgroundPosition: 'right center',
            color: '#fff',
            textDecoration: 'none',
        }   
    },
    buttonCss1 : {
        height : 50,
        width : 160,
         
        backgroundImage: 'linear-gradient(to right, #FDFC47 0%, #24FE41  51%, #FDFC47  100%)',
        textAlign: 'center',
        textTransform: 'capitalize !important',
        transition: '0.5s !important',
        backgroundSize: '200% auto !important',
        color: '#40581f !important',          
        boxShadow: '0 0 20px #eee !important',
        borderRadius: '30px !important',
        padding : '10px 10px !important',
        fontSize : '17px !important', fontWeight : 'bold !important',
 
        "&:hover" : {
            backgroundPosition: 'right center',
            color: '#fff',
            textDecoration: 'none',
        }   
    }
})) ;