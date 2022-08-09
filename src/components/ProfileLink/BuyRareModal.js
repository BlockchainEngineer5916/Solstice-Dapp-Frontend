import React, { useEffect, useState } from 'react' ;

import { useWalletInfo } from '../../contexts/WalletContext';
import { useStripeInfo } from '../../contexts/StripeContext';

import { connect } from 'react-redux';
import PropTypes from 'prop-types' ;
import { UpdateBidDB , LoadingSellerProductsList, UserInfoById, UpdateSellerCustomer} from '../../redux/actions/link' ;

import { PlaceBid } from '../../redux/actions/bid';
import { NFTBalance } from '../../web3/fetch';
import { CreateNotify } from '../../firebase/notify_collection';

import swal from 'sweetalert';
import CloseIcon from '@mui/icons-material/Close';

import Loading from 'react-loading-components' ;

import { getUnit, getCookie } from '../../utils/Helper';

import { toast } from 'react-toastify/dist/react-toastify';

import  {
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    Box,
    Button,
    TextField,
    Grid,
} from '@mui/material' ;

import { useStyles } from './StylesDiv/BuyRare.styles';

const BuyRareModal = (props) => {

    const classes = useStyles() ;

    const {
        open,
        handleClose,

        productInfo,
        creator_profile_picture_url
    } = props ;

    const {
        isStripeConnected
    } = useStripeInfo() ;

    const {
        web3Provider,
        walletAddress,
        isWalletConnected
    } = useWalletInfo() ;

    const [bidPrice, setBidPrice] = useState(0) ;
    const [bidAmount, setBidAmount] = useState(0) ;
    const [balanceOf, setBalanceOf] = useState(0) ;

    const handleBidAmount = (value) => {
        setBidAmount(Number(Number(value).toFixed(0))) ;
    }
    const handlePlaceBid = async  () => {
        if(Number(productInfo?.minimum_bidding) > bidPrice) {
            return swal({
                title : 'Warning',
                text : "Bid price is too low",
                buttons: false,
                timer : 3000,
                icon : 'warning'
            })
        }
        if(Number(balanceOf < bidAmount)) {
            return swal({
                title : 'Warning',
                text : "Overflow Bid Amount",
                buttons: false,
                timer : 3000,
                icon : 'warning'
            })
        }
        if( await swal({
            title : 'Confirm',
            text : "Are you sure that you place bid?",
            buttons: [
                'No, I am not sure!',
                'Yes, I am sure!'
            ],
            icon : 'info'
        })) {
            handleClose() ;

            const id = toast.loading("[Place Bid] Tx is pending...");

            let txPlaceBid = await PlaceBid(
                productInfo.creator_id,
                productInfo.creator_wallet,
                creator_profile_picture_url,
                getCookie('_SOLSTICE_BUYER'),
                walletAddress,
                productInfo.id,
                productInfo.product_name,
                productInfo.product_type,
                productInfo.product_description,
                productInfo.nft_id,
                'rare',
                productInfo.minimum_bidding,
                bidAmount,
                bidPrice,
                productInfo.bid_unit,
            ) ;

            if(txPlaceBid) {
                toast.update(id, { render: "[Place Bid] Tx is successful", type: "success", autoClose: 5000, isLoading: false });
                
                let buyerInfo = await UserInfoById(getCookie('_SOLSTICE_BUYER')) ;

                await CreateNotify({
                    buyer : {
                        email : buyerInfo.email,
                        profile_link : buyerInfo.profile_link,
                        account_name : buyerInfo.account_name 
                    },
                    price : bidPrice,
                    amount : bidAmount,
                    product : productInfo?.product_name,
                    unit : productInfo?.bid_unit,
                    purchased_at : new Date().toLocaleDateString(),
                    seller : getCookie('_SOLSTICE_SELLER'),
                    type : 'rare'
                }) ;
            }
            else {
                toast.update(id, { render:'[Place Bid] Tx is failed' , type: "error", autoClose: 5000, isLoading: false });
            }
        }
    }

    useEffect(async () => { 
        if(productInfo) {
            setBidPrice(productInfo.minimum_bidding);
        }
    }, [productInfo]) ;

    useEffect(async () => {
        if(web3Provider) {
            let balanceOf = await NFTBalance(Number(productInfo.nft_id), productInfo.creator_wallet) ;
            
            setBalanceOf(Number(balanceOf) - 1) ;
            setBidAmount(Number(balanceOf) - 1) ;
        }
    }, [web3Provider]) ;

    return (
        <Box className={classes.root}>
            <Dialog
                open={open}
                fullWidth
                classes ={{
                    paper : classes.paper
                }}
                hideBackdrop={true}
            >
                <Box className={classes.greenBlur} />
                <Box className={classes.blueBlur} />
                <DialogTitle>
                    <Box>
                        Bid : { `[ ${productInfo?.product_name} ]` }
                    </Box>
                   <CloseIcon onClick={handleClose} sx={{cursor : 'pointer'}} className={classes.closeButtonCss} />
                </DialogTitle>
                <Box className={classes.dividerDiv} />
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <Box sx={{mb : '10px'}}>Minimum Bidding Price</Box>
                            <Box sx={{fontSize: '20px'}}>
                                { productInfo?.minimum_bidding } {getUnit(productInfo?.bid_unit)}
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{mb : '10px'}}># of Minted Items</Box>
                            <Box sx={{fontSize: '20px'}}>
                                { productInfo?.available_items }
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{mb : '10px'}}>Royalty</Box>
                            <Box sx={{fontSize: '20px'}}>
                                { productInfo?.royalty } %
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{mb : '10px'}}>Status</Box>
                            <Box sx={{fontSize: '15px'}}>
                                nft balance Of creator : { balanceOf }<br/>
                                # of sold nft : { productInfo?.available_items - balanceOf }
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{mb : '10px'}}>Bid Price</Box>
                            <Box >
                                <TextField
                                    type={'number'}
                                    min={productInfo?.minimum_bidding || 0}
                                    value={bidPrice}
                                    onChange={(e) => setBidPrice(e.target.value)}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{mb : '10px'}}>Item Amount</Box>
                            <Box >
                                <TextField
                                    type={'number'}
                                    min={productInfo?.minimum_bidding || 0}
                                    value={bidAmount}
                                    onChange={(e) => handleBidAmount(e.target.value)}
                                />
                            </Box>
                        </Grid>
                        {
                            !balanceOf ? <Grid item xs={12}>
                                    <Box sx={{fontSize: '15px'}}>
                                    All these nfts had been sold out.
                                </Box>
                            </Grid> : <></>
                        }
                    </Grid>
                </DialogContent>
                <Box className={classes.dividerDiv} />
                <DialogActions>
                    <Button variant={'contained'} onClick={handlePlaceBid} 
                        disabled={  Number(bidAmount) === 0 || Number(bidPrice) === 0  || Number(balanceOf) === 0 }
                    >
                        Place bid
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
BuyRareModal.propTypes = {
    LoadingSellerProductsList : PropTypes.func.isRequired,
    UpdateSellerCustomer : PropTypes.func.isRequired
}
const mapStateToProps = state => ({
    creator_profile_picture_url : state.link.profilePictureUrl
})
const mapDispatchToProps = {
    LoadingSellerProductsList,
    UpdateSellerCustomer
}
export default connect(mapStateToProps, mapDispatchToProps)(BuyRareModal) ;