import * as React from 'react' ;
import { useLocation, useSearchParams } from 'react-router-dom';

import { connect } from 'react-redux';
import PropTypes from 'prop-types' ;
import { WholeInformation, CheckingProductUrl,  InitSOLInfo } from '../../redux/actions/sol';

// import ProductScreen from './ProductScreen';
import NotFound from '../../components/Common/NotFound';

import Loading from 'react-loading-components' ;

import {
    Box
} from '@mui/material' ;

import  {makeStyles, useTheme} from '@mui/styles' ;

const useStyles = makeStyles((theme) => ({
    root : {

    },
    loadingDiv : {
        width : '100%' , minHeight : '100vh',
        display : 'flex', justifyContent : 'center', alignItems : 'center', flexDirection : 'column', gap : '10px',
        background : theme.palette.blue.main
    }
})) ;

const SOLSLink = (props) => {
    const classes = useStyles() ;
    const theme = useTheme() ;

    const [urlParams, setUrlParams] = useSearchParams() ;
    const [isPassed, setPassed] = React.useState(false) ;

    const {
        WholeInformation,
        CheckingProductUrl,
        InitSOLInfo,
        checkingProductUrl,
    } = props ;

    React.useEffect(async () => {
        if(urlParams) {

            await CheckingProductUrl(true) ;
            
            if( !await WholeInformation(urlParams.get('access_key'), urlParams.get('license_key'))) {
                setPassed(false) ;  
                await CheckingProductUrl(false) ;  

                return ;
            }

            await CheckingProductUrl(false) ;
            setPassed(true) ;
        }
    }, [urlParams]) ;

    React.useEffect(() => {
        return () => {
            InitSOLInfo() ;
        }
    }, []) ;

    return (
        <>
            {
                checkingProductUrl ? <Box className={classes.loadingDiv}>
                    <Loading type='puff' width={100} height={100} fill='#43D9AD' />
                    <Box sx={{color : theme.palette.green.G200, fontSize : '30px', letterSpacing : '5px'}}>...Verify Access Key</Box>
                </Box> :
                (
                    !isPassed  ? <NotFound /> : <></>
                )
            }
        </>
    )
}

SOLSLink.propTypes = {
    WholeInformation : PropTypes.func.isRequired,
    CheckingProductUrl : PropTypes.func.isRequired,
    InitSOLInfo : PropTypes.func.isRequired
}
const mapStateToProps = state => ({
    checkingProductUrl : state.sol.checkingProductUrl,
}) ;
const mapDispatchToProps = {
    WholeInformation,
    CheckingProductUrl,
    InitSOLInfo
} ;
export default connect(mapStateToProps, mapDispatchToProps)(SOLSLink) ;