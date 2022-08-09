import { makeStyles } from '@mui/styles' ;

export const useStyles = makeStyles((theme) => ({
    root : {
        
    },
    paper : {
        overflow : 'hidden !important',
        backgroundColor : theme.palette.blue.main + ' !important',
        borderRadius : '15px !important', border : '1px solid ' + theme.palette.blue.B100 + " !important",
        
        "& .MuiDialogTitle-root" : {
            color : theme.palette.green.G200,
            display : 'flex', justifyContent : 'space-between', alignItems : 'center'
        },

        "& .MuiDialogContent-root" : {
            color : theme.palette.green.G200, fontSize : 20
        },

        "& .MuiButtonBase-root" : {
            textTransform : 'capitalize !important',
            color : theme.palette.green.G200, fontSize : 20,
            minWidth : '150px !important',
            borderRadius : 25,
            backgroundColor : theme.palette.blue.B300 + ' !important'
        },

        "& .MuiInputAdornment-root" : {
            "& p" :{
                color : '#43D9AD !important'
            } 
        },
        "& .MuiInputLabel-root" : {
            color : "#43D9AD !important",
        },

        "& .MuiFormControl-root" : {
            borderRadius : 5,
            padding : '0px !important',
            color : '#43D9AD',
            "& svg" :{
                color : 'white'
            }
        },

        '& .MuiOutlinedInput-root': {
            fontSize : '20px !important',
            '& fieldset': {
                borderColor: theme.palette.green.G400 + ' !important',
            },
            '&:hover fieldset': {
                borderColor: theme.palette.green.G400 + ' !important',
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.green.G400 + ' !important'
            },
        },

        "& .MuiInputBase-input" :{
            padding : '10px !important',
            display : 'flex !important', alignItems : 'center !important',
            paddingLeft : '10px !important',
            color : '#43D9AD !important',
        },
        "& .MuiButtonBase-root.Mui-disabled": {
            WebkitTextFillColor: 'gray',
            cursor : 'not-allowed'
        },
        "& .MuiFormHelperText-root" : {
            background : '#010C15 !important',
            color : 'red !important',
            marginTop : '10px !important'
        },
        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
        {
            display: 'none',
        },
    },
    dividerDiv : {
        borderBottom : '1px solid #1d393c',
    },
    selectDiv : {
        "& .MuiList-root" : {
            backgroundColor : theme.palette.blue.main + ' !important',
            padding : '0px !important',
        },
        "& .MuiMenuItem-root" : {
            borderBottom : '1px solid '+theme.palette.green.G400+' !important',
            "&:last-child" : {
                borderBottom : 'none !important',
            },
            background : theme.palette.blue.B300 + " !important",
            color : theme.palette.green.G200 + " !important",
            fontSize : 20,
        },
       "& .MuiBackdrop-root" : {
           background : 'transparent !important'
       }
    },
    closeButtonCss : {
        border  :'2px solid #1d393c', borderRadius : '50%',
        padding : 2,
        "&:hover" : {
            color : theme.palette.green.G100
        }
    },
    greenBlur : {
        background: theme.palette.green.G200,
        position : 'absolute', left: 45, bottom : 0,
        width: 180, height: 100,
        opacity: '0.2',
        filter: 'blur(55px)',
        transform: 'rotate(-140.38deg)'
    },
    blueBlur : {
        background: theme.palette.blue.B100,
        width: 150, height: 150,
        position : 'absolute', right: 45, top: 0,
        opacity: '0.35',
        filter: 'blur(55px)',
        transform: 'rotate(-140.38deg)'
    },
})) ;