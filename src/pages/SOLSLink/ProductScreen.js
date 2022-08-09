import React, { useState, useEffect, useRef} from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMeasure } from 'react-use';
import { useWalletInfo } from '../../contexts/WalletContext';

import { connect } from 'react-redux' ;
import PropTypes from 'prop-types';
import { UserInfoById, UpdateSellerCustomer, } from '../../redux/actions/link';
import { UpdateBundleBuyersMeta } from '../../firebase/product_collection';
import { SendAccessUrlByEmail } from '../../redux/actions/sol';
import { Payment } from '../../web3/market';


import { CreateNotify } from '../../firebase/notify_collection';
import Loading from 'react-loading-components' ;

import UserImage from '../../assets/profile/User.svg' ;

import PdfPreview from '../../components/Common/PdfPreview';
import DocxPreview from '../../components/Common/DocxPreview';
import PdfFullScreen from '../../components/Common/PdfFullScreen';
import DocxFullScreen from '../../components/Common/DocxFullScreen';
import ImageFullScreen from '../../components/Common/ImageFullScreen';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import MetamaskConn from '../../components/Common/Wallets/MetamaskConn';

import LockImage from '../../assets/profile/Lock.png';

import { v4 as uuidv4 } from 'uuid' ;

import { toast } from 'react-toastify/dist/react-toastify';

import {
    Box,
    Grid,
    Button,
    useMediaQuery
} from '@mui/material' ;

import { useTheme } from '@mui/styles';
import { useStyles } from './StylesDiv/Product.styles';

const ProductScreen = (props) => {
    const {
        solInfo,
        creatorInfo,
        productInfo,
        buyerInfo,

        UpdateSellerCustomer,
    } = props;

    const {
        isWalletConnected,
        web3Provider
    } = useWalletInfo() ;
 
    const classes = useStyles();
    const theme = useTheme() ;
    const match850 = useMediaQuery('(min-width : 850px)') ;

    const navigate = useNavigate();

    const [urlParams, setUrlParams] = useSearchParams() ;
    const [isPaid, setIsPaid] = React.useState(false) ;

    const [openPdf, setOpenPdf] = React.useState(false) ;
    const [openPdfPath, setOpenPdfPath] = React.useState(null) ;

    const [openDocx, setOpenDocx] = React.useState(false) ;
    const [openDocxPath, setOpenDocxPath] = React.useState(null) ;
    
    const [openImage, setOpenImage] = React.useState(false) ;
    const [openImagePath, setOpenImagePath] = React.useState(false) ;

    const screenCtrl = useRef() ;

    const [ setScreenCtrl, {width, height} ] = useMeasure() ;
    
    const handleActivate = async () => {
        if(!isWalletConnected) return swal({
            title : 'Please, Connect With Metamask',
            text : "You can't pay without your wallet",
            icon : 'info',
            buttons : false,
            timer : 3000
        }) ;

        let buyer ;

        let temp = Object.entries(productInfo.buyers).filter(([id, buyer]) => 
            buyer.license_key === urlParams.get('license_key') 
        ) ;

        if(temp.length) {
            buyer = temp[0][1]
        }
        
        const id = toast.loading("[Activate Product] Tx is pending...");

        let txResult = await Payment(web3Provider, productInfo?.creator_wallet, productInfo?.bundle_price, productInfo?.bundle_unit) ;

        if( txResult === 200 ) {
          
            let license_key = await UpdateBundleBuyersMeta(buyer, productInfo?.id) ;

            if(license_key) {
                toast.update(id, { render: "[Activate Product] Tx is successful", type: "success", autoClose: 5000, isLoading: false });

                let buyerInfo = await UserInfoById(buyer.buyer_id) ;

                await CreateNotify({
                    buyer : {
                        email : buyerInfo.email,
                        profile_link : buyerInfo.profile_link,
                        account_name : buyerInfo.account_name 
                    },
                    price : productInfo?.bundle_price,
                    product : productInfo?.product_name,
                    unit : productInfo?.bundle_unit,
                    purchased_at : new Date().toLocaleDateString(),
                    seller : creatorInfo.id,
                    type : 'bundle'
                }) ;

                await UpdateSellerCustomer(buyerInfo) ;

                await SendAccessUrlByEmail(productInfo?.id, creatorInfo, buyerInfo, urlParams.get('access_key'), license_key) ;

                navigate('/sols?access_key=' + urlParams.get('access_key') + "&license_key=" + license_key) ;
            } else {
                toast.update(id, { render: "[Activate Product] Tx is failed" , type: "error", autoClose: 5000, isLoading: false });
            }
        }
    }

    useEffect(() => {
        setScreenCtrl(screenCtrl.current) ;
    }, []) ;

    useEffect(() => {
        return () => {
        }
    }, []) ;

    useEffect(() => {
        if(productInfo?.price_type === 'bundle') {
            setIsPaid(new Date().getTime() - new Date(productInfo?.buyers_meta[buyerInfo.id].paid_at).getTime() < 30 * 24 * 60 * 60 * 1000) ;
            return ;
        }

        setIsPaid(true) ;
    }, [productInfo]) ;

    useEffect(() => {
        console.log(isPaid) ;
    }, [isPaid]) ;

    return (
        <Box className={classes.root}>
            <Box className={classes.greenBlur} />
            <Box className={classes.blueBlur} />

            <Grid className={classes.productDiv} container >
                <Grid item xs={match850 ? 6 : 12} >
                    <Box className={classes.watchDiv} ref={screenCtrl} sx={{height : width}}>
                        {
                            !isPaid ? <>
                                {
                                    <Box >
                                        <img src={LockImage} width={100} height={100} />
                                    </Box>

                                }
                            </>
                            : <>
                                {
                                    solInfo?.category === 'video' ? <video src={solInfo.path } controls width={'100%'} height={'100%'}/>
                                    : solInfo?.category === 'image' ? 
                                        <img src={solInfo.path} width={width} height={width} />
                                    : solInfo?.category === 'pdf' ? 
                                        <PdfPreview
                                            previewUrl={solInfo?.path}
                                            width={width}
                                            height={width}
                                            key={uuidv4()}
                                        /> 
                                    : new String("application/doc,application/docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document").search(solInfo.type) >=0 ?
                                        <DocxPreview
                                            previewUrl={solInfo?.path}
                                            width={width}
                                            height={width}
                                            key={uuidv4()}
                                            activeIndex={0}
                                            selfIndex={0}
                                            forceHide={openDocx}
                                        />
                                    : <></>
                                }
                                {
                                    (
                                        solInfo?.category === 'image' || 
                                        solInfo?.category === 'pdf' ||
                                        solInfo?.category === 'vnd.openxmlformats-officedocument.wordprocessingml.document'
                                    ) &&
                                    <Box className={classes.fullIconDiv} onClick={() => {
                                        switch(solInfo?.category) {
                                            case 'vnd.openxmlformats-officedocument.wordprocessingml.document' :
                                                setOpenDocx(true);
                                                setOpenDocxPath(solInfo.path) ;
                                                return ;
                                            case 'pdf' : 
                                                setOpenPdf(true);
                                                setOpenPdfPath(solInfo.path) ;
                                                return ;
                                            case 'image' :
                                                setOpenImage(true) ;
                                                setOpenImagePath(solInfo.path) ;
                                                return ;
                                            default :
                                                return;
                                        }
                                    }}>
                                        <FullscreenIcon />
                                    </Box>
                                }
                            </>
                        }
                    </Box>
                </Grid>
                
                <Grid item xs={match850 ? 6 : 12} sx={{mt : !match850 ? '20px' : 0}}>
                    <Box className={classes.infoDiv}>
                        <Box>
                            <img src={creatorInfo?.profile_picture_url || UserImage} width={70} height={70}/>
                            {/* <img src={creatorInfo?.cover_picture_url} width={'100%'} height={50} /> */}
                        </Box>
                        <Box>
                            Creator : { creatorInfo?.full_name }
                        </Box>
                        <Box>
                            Created At : { new Date(productInfo?.created_at).toLocaleDateString() }
                        </Box>
                        <Box>
                            Product Name : { productInfo?.product_name }  
                        </Box>
                        <Box sx={{textTransform : 'capitalize'}}>
                            Price Type : {`${productInfo?.price_type}`}
                        </Box>
                        {
                            productInfo?.price_type === 'legendary' &&
                            <>
                                <Box>
                                    Price Per Product : { productInfo?.product_price } USD
                                </Box>
                                {
                                    productInfo?.resell === "YES" ?  <>
                                        <Box>
                                            Price Per Ticket : { productInfo?.ticket_price } USD
                                        </Box>
                                        <Box>
                                            # of Ticket Available :  { productInfo?.ticket_count }
                                        </Box>
                                    </> : <></>
                                }
                            </>
                        }
                        {
                            productInfo?.price_type === 'rare' &&
                            <>
                                <Box>
                                    Minimum Bidding Price : {productInfo?.minimum_bidding} USD
                                </Box>
                                <Box>
                                    # of Available Items :  {productInfo?.available_items}
                                </Box>
                            </>
                        }
                        {
                            productInfo?.price_type === 'bundle' &&
                            <>
                                <Box>
                                    Price Per Subscription :  { productInfo?.bundle_price } USD
                                </Box>
                                <Box>
                                    Payment :  Monthly
                                </Box>
                                <Box>
                                    Release Date :  { new Date(productInfo?.release_date).toLocaleDateString() }
                                </Box>
                                <Box>
                                    Distribution Schedule :  Weekly
                                </Box>
                            </>
                        }
                        {
                            productInfo?.price_type === 'free' &&
                            <>
                                <Box>
                                    Release Date : {new Date(productInfo?.release_date).toLocaleDateString()}
                                </Box>
                            </>
                        }
                        {
                            !isPaid ?  <Grid container>
                                <Grid item xs={6} sx={{justifyContent : 'flex-end', alignItems : 'flex-end !important'}}>
                                    <Button className={classes.buttonCss1} onClick={handleActivate} >Activate</Button>
                                </Grid> 
                                <Grid item xs={6} sx={{justifyContent : 'flex-end', alignItems : 'flex-end !important'}}>
                                    <MetamaskConn />
                                </Grid>
                            </Grid>
                            : <Box sx={{justifyContent : 'flex-end', alignItems : 'flex-end !important'}}>
                                <Button className={classes.buttonCss2} >Download</Button>
                            </Box>
                        }
                    </Box>
                </Grid>
            </Grid>

            <PdfFullScreen 
                open={openPdf}
                previewUrl={openPdfPath}
                handleClose={setOpenPdf}
            />
            <DocxFullScreen 
                open={openDocx}
                previewUrl={openDocxPath}
                handleClose={setOpenDocx}
            />
            <ImageFullScreen
                open={openImage}
                previewUrl={openImagePath}
                handleClose={setOpenImage}
            />
        </Box>
    );
}

ProductScreen.propTypes = {
    UpdateSellerCustomer : PropTypes.func.isRequired,
}
const mapStateToProps = state => ({
    solInfo : state.sol.solInfo,
    creatorInfo : state.sol.creatorInfo,
    productInfo : state.sol.productInfo,
    buyerInfo : state.sol.buyerInfo
})
const mapDispatchToProps = {
    UpdateSellerCustomer,
}
export default connect(mapStateToProps, mapDispatchToProps)(ProductScreen);