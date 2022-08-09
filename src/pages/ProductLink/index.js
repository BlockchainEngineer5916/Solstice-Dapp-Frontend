import * as React from 'react' ;
import { useLocation, useSearchParams } from 'react-router-dom';

import { connect } from 'react-redux';
import PropTypes from 'prop-types' ;

import NotFound from '../../components/Common/NotFound';

import Loading from 'react-loading-components' ;
import { ProductInfoByAccessKey } from '../../firebase/product_collection' ;
import { uuidValidateV4 } from '../../utils/Helper';

import {
    Box
} from '@mui/material' ;

import  {makeStyles, useTheme} from '@mui/styles' ;
import ProductTotalInfo from '../../components/ProductLink/ProductTotalInfo';

const useStyles = makeStyles((theme) => ({
    root : {
        overflowY : 'hidden !important',
        border : '1px solid red'
    },
    loadingDiv : {
        width : '100%' , minHeight : '100vh',
        display : 'flex', justifyContent : 'center', alignItems : 'center', flexDirection : 'column', gap : '10px',
        background : theme.palette.blue.main
    }
})) ;

const ProductLink = (props) => {
    const classes = useStyles() ;
    const theme = useTheme() ;

    const {
    } = props ;
    
    const [urlParams, setUrlParams] = useSearchParams() ;
    const [isPassed, setPassed] = React.useState(false) ;
    const [productInfo, setProductInfo] = React.useState(null) ;
    const [loading, setLoading] = React.useState(true) ;

    const failLoading = async () => {
        setPassed(false) ;
        setLoading(false) ;
    }

    const successLoading = async () => {
        setPassed(true);
        setLoading(false) ;
    }
    
    React.useEffect(async () => {
        if(urlParams) {

            if(!urlParams.get('access_key')) {
                failLoading() ;
                return ;
            }

            let isValid  = await uuidValidateV4(urlParams.get('access_key')) ;

            if(!isValid) {
                failLoading() ;
                return ;
            }

            let productInfo = await ProductInfoByAccessKey(urlParams.get('access_key')) ;

            if(!productInfo) {
                failLoading();
                return ;
            }

            setProductInfo(productInfo) ;
            
            successLoading() ;
        }
    }, [urlParams]) ;

    React.useEffect(() => {
        return () => {

        }
    }, []) ;

    return (
        <>
            {
                loading ? <Box className={classes.loadingDiv}>
                    <Loading type='puff' width={100} height={100} fill='#43D9AD' />
                    <Box sx={{color : theme.palette.green.G200, fontSize : '30px', letterSpacing : '5px'}}>...Checking URL</Box>
                </Box> :
                (
                    !isPassed  ? <NotFound /> : <ProductTotalInfo
                        productInfo={productInfo}
                    />
                )
            }
        </>
    )
}

ProductLink.propTypes = {
}
const mapStateToProps = state => ({
}) ;
const mapDispatchToProps = {
} ;
export default connect(mapStateToProps, mapDispatchToProps)(ProductLink) ;