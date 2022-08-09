import React,{useRef, useEffect, useState} from 'react' ;

import { useMeasure } from 'react-use';
import { useWalletInfo } from '../../../contexts/WalletContext';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { UserAccountInfo } from '../../../redux/actions/profile';
import { InputPriceConfig } from '../../../redux/actions/upload';

import AddImage from '../../../assets/upload/Add.svg';
import TickProductImage from '../../../assets/profile/TickProductType.svg';

import StepperControl from '../../../components/Solstice/UploadScreen/StepperControl';

import { getCookie , getUuid} from '../../../utils/Helper';

import {
    Box,
    Grid,
    TextField,
    useMediaQuery,
} from '@mui/material';
  
import { useStyles } from './StylesDiv/PriceConfig.styles' ;
import swal from 'sweetalert';

const PriceConfig = (props) => {
    const classes = useStyles() ;
    
    const match1220 = useMediaQuery('(min-width : 1220px)') ;

    const {
        isWalletConnected
    } = useWalletInfo() ;

    const {
        handleChangeUploadStep,
        UserAccountInfo,
        InputPriceConfig,

        accountName,
        productTypeList,
        productName,

        solsPriceType,
        solsProductType,
        legenResell,
        solsProductDescription
    } = props;

    const topCtrl = useRef() ;

    const [setTopCtrl, {width, height}] = useMeasure() ;

    const [disableContinue, setDisableContinue] = useState(true) ;

    const [newLine, setNewLine] = useState(false) ;
    const [productType, setProductType] = useState(null);
    const [priceType, setPriceType] = useState("legendary") ;
    
    const [productDescription, setProductDescription] = useState('') ;
    const [resellTick, setResellTick] = useState("NO") ;

    const handleChangeDescription = (e) => {
        if(e.target.value.length === 1 && e.target.value !== ">") {
            setProductDescription("> " + e.target.value);
            return ;
        }
        if(newLine) setProductDescription(e.target.value+"> ") ;
        else setProductDescription(e.target.value) ;

        setNewLine(false);
    }

    const handleEnterEvent = (e) => {
        if(e.which === 13) setNewLine(true) ;
    }

    const handleResellTick = () => {
        if(resellTick === 'YES') setResellTick('NO')
        else if(!isWalletConnected){
            return swal({
                title : 'Connect to your wallet',
                text : 'If you want to upload Legendary product as NFT, you should connect with your wallet',
                icon : 'info',
                buttons : false,
                timer : 5000
            })
        } else setResellTick('YES') ;
    }
    
    const handlePriceType = (price_type) => {
        if(!isWalletConnected && (price_type === 'rare') ) {
            return swal({
                title : 'Connect to your wallet',
                text : 'Rare product is NFT, so you should connect with your wallet',
                buttons : false,
                icon : 'info',
                timer : 5000
            });
        }
        setPriceType(price_type) ;
    }

    const handleBack = () => {
        handleChangeUploadStep('sols-video') ;
    }
    
    const handleContinue = () => {
        InputPriceConfig(productDescription, resellTick, priceType, productType) ;
        if(priceType === 'legendary') handleChangeUploadStep('legendary-price') ;
        if(priceType === 'rare') handleChangeUploadStep('rare-price') ;
        if(priceType === 'bundle') handleChangeUploadStep('bundle-price') ;
        if(priceType === 'free') handleChangeUploadStep('free-price') ;
    }

    useEffect(() => {
        setTopCtrl(topCtrl.current) ;
    }, []) ;

    useEffect(() => {
    }, [height]) ;

    useEffect(() => {
        UserAccountInfo(getCookie('_SOLSTICE_AUTHUSER')) ;
    }, []) ;

    useEffect(() => {
        if(!isWalletConnected && (solsPriceType === 'rare')) {
            setPriceType('bundle') ;
        } else {
            setPriceType(solsPriceType) ;
        }
        setProductType(solsProductType) ;
        setResellTick(legenResell) ;
        setProductDescription(solsProductDescription) ;
        
    },[solsProductType, solsPriceType, legenResell, solsProductDescription]) ;

    useEffect(() => {
        if(productType) setDisableContinue(false) ;
        else setDisableContinue(true) ;
    }, [productType]) ;

    return (
        <Box className={classes.root}>
            <Box className={classes.greenBlur} />
            <Box className={classes.blueBlur} />
            <Box className={classes.zeroToOneDiv}>
                {productName}
            </Box>
            <Grid container >
                <Grid item xs={match1220 ? 6 : 12} sx={{display : 'flex', justifyContent : 'center'}}>
                    <Box className={classes.messageDiv}>
                        <Box className={classes.chatDiv}>
                            &gt; Welcome !
                        </Box>
                        <Box className={classes.chatDiv} sx={{mb : '10px'}}>
                            &gt; You can upload and mint products of { solsProductType }
                        </Box>
                     
                        <TextField
                            placeholder='> You can leave description about product here.'
                            focused
                            multiline
                            value={productDescription}
                            onChange={handleChangeDescription}
                            onKeyDown={handleEnterEvent}
                        />
                    </Box>
                </Grid>
                <Grid item xs={match1220 ? 6 : 12} sx={{display : 'flex', flexDirection : 'column', alignItems : match1220 ? 'flex-start' : 'center', pt : '20px'}}>
                    <Box className={classes.settingDiv} sx={{mb : '30px'}}>
                        <Box sx={{ color : '#8A94A6',  fontSize : 30}}>Admin</Box>
                        <Box className={classes.settingIconDiv}>
                            <img src={AddImage} />
                        </Box> 
                    </Box>
                    {
                        priceType === 'legendary' && <Box className={classes.settingDiv}>
                            <Box sx={{ color : '#8A94A6',  fontSize : 30}}>Resell</Box>
                            <Box sx={{fontSize : 30,color : '#43D9AD'}} onClick={handleResellTick}>
                                { resellTick }
                            </Box> 
                        </Box>
                    }
                </Grid>
            </Grid>
            <Grid container className={classes.linkDiv} >
                <Grid item xs={12} sx={{display : 'flex', justifyContent : match1220 ? 'flex-start' : 'space-around', alignItems : 'center', flexWrap : 'wrap', gap : '10px'}}>
                    {
                        productTypeList?.map((item, index) => {
                            return (
                                <Box className={classes.linkItemDiv} key={index} >
                                    {productType === item && <><img src={TickProductImage} width={20}/>&nbsp;</>}
                                    {productType === item ? item.replace('#','') : item}
                                </Box>
                            )
                        })
                    }
                </Grid>
            </Grid>
            <Grid container className={classes.productTypeDiv}>
                <Grid item xs={match1220 ? 6 : 12} sx={{display : 'flex', flexDirection : 'column', alignItems : 'center', justifyContent : 'space-between', gap : '10px'}}>
                    <Box className={classes.productTypeLabel} >
                        Select Pricing
                    </Box>
                    <Box className={classes.typeDiv} sx={{background : priceType === 'legendary' ? "#375068" : "#253341"}} onClick={() => handlePriceType("legendary")}>
                        <Box sx={{color :"#806BD6" }}>Legendary : &nbsp;</Box>
                        <Box sx={{color : '#43D9AD'}}>Open market, fixed price/product</Box>
                    </Box>
                    <Box className={classes.typeDiv} sx={{background : priceType === 'rare' ? "#375068" : "#253341"}} onClick={() => handlePriceType("rare")}>
                        <Box sx={{color :"#338BEF" }}>Rare : &nbsp;</Box>
                        <Box sx={{color : '#43D9AD'}}>Exclusive digital products</Box>
                    </Box>
                    <Box className={classes.typeDiv} sx={{background : priceType === 'bundle' ? "#375068" : "#253341"}} onClick={() => handlePriceType("bundle")}>
                        <Box sx={{color :"#F4F681" }}>Bundle : &nbsp;</Box>
                        <Box sx={{color : '#43D9AD'}}>Subscription based content packages</Box>
                    </Box>
                    <Box className={classes.typeDiv} sx={{background : priceType === 'free' ? "#375068" : "#253341"}} onClick={() => handlePriceType("free")}>
                        <Box sx={{color :"orange" }}>Free : &nbsp;</Box>
                        <Box sx={{color : '#43D9AD'}}>Free content distribution</Box>
                    </Box>
                </Grid>
                <Grid item xs={match1220 ? 6 : 12} sx={{display : 'flex', justifyContent : match1220 ? 'flex-start' : 'center', pt : '30px'}}>
                    {
                        priceType === "legendary" && <Box className={classes.typeDetailDiv}>
                            <Box className={classes.typeTitleDiv} sx={{color :"#806BD6" }}>Legendary</Box>
                            <Box className={classes.typeDescriptionDiv}>&gt; Great for Ebooks, workout programs, courses, videos, and more!</Box>
                        </Box>
                    }
                    {
                        priceType === "rare" && <Box className={classes.typeDetailDiv}>
                            <Box className={classes.typeTitleDiv} sx={{color :"#338BEF" }}>Rare</Box>
                            <Box className={classes.typeDescriptionDiv}>&gt; Great for collectables, tickets, or any digital product that is limited in supply</Box>
                        </Box>
                    }
                    {
                        priceType === "bundle" && <Box className={classes.typeDetailDiv}>
                            <Box className={classes.typeTitleDiv} sx={{color :"#F4F681" }}>Bundle</Box>
                            <Box className={classes.typeDescriptionDiv}>&gt; Great for courses, weekly live lectures, newsletters, video content.</Box>
                        </Box>
                    }
                    {
                        priceType === "free" && <Box className={classes.typeDetailDiv}>
                            <Box className={classes.typeTitleDiv} sx={{color :"orange" }}>Free</Box>
                            <Box className={classes.typeDescriptionDiv}>&gt; Free content distribution</Box>
                        </Box>
                    }
                </Grid>
                <Grid item xs={12}>
                    <StepperControl 
                        activeStep={1}
                        handleContinue={handleContinue}
                        handleBack={handleBack}

                        disableContinue={disableContinue}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}
PriceConfig.propTypes = {
    InputPriceConfig : PropTypes.func.isRequired,
    UserAccountInfo : PropTypes.func.isRequired
} ;
const mapStateToProps = state => ({
    accountName : state.profile.accountName,
    productTypeList : state.profile.productTypeList,

    productName : state.upload.productName,

    legenResell : state.upload.legenResell,
    solsPriceType : state.upload.solsPriceType,
    solsProductType : state.upload.solsProductType,
    solsProductDescription : state.upload.solsProductDescription
}) ;
const mapDispatchToProps = {
    UserAccountInfo,
    InputPriceConfig
} ;
export default connect(mapStateToProps, mapDispatchToProps)(PriceConfig) ;     