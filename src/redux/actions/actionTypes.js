const ActionTypes = {
    // Stripe Connect Flow
    ConnectAppToStripe : "ConnectAppToStripe",
    ConnectStripe : "ConnectStripe",
    DisconnectStripe : "DisconnectStripe",

    // Payment Flow 
    PaymentsList : "PaymentsList",
    FetchAllPayments : "FetchAllPayments",

    
    // Wallet Connect Flow
    ConnectAppToWallet : "ConnectAppToWallet",
    AccountChanged : "AccountChanged" ,
    UpdateWalletData : "UpdateWalletData",
    
    // Create Account Flow
    LoadingCodeSend : "LoadingCodeSend",
    LoadingSignUp : "LoadingSignUp",
    LoadingSignIn : "LoadingSignIn",
    PhoneVerifyCodeSent : "PhoneVerifyCodeSent",

    InputUserMainInfo : "InputUserMainInfo",

    InputAccountName : "InputAccountName",
    InputAccountType : "InputAccountType",
    InputAccountInfo : "InputAccountInfo",

    InputSocialInfo : "InputSocialInfo",
    InputSyncSocial : "InputSyncSocial",

    InputImagesForUser : "InputImagesForUser",

    SignUpFinalUserInfo : 'SignUpFinalUserInfo',
    SignInUserWithEmailAndPassword : "SignInUserWithEmailAndPassword",
    SignInWithGoogle : "SignInWithGoogle",
    SignInUser : "SignInUser",

    InitAuthReducer : "InitAuthReducer",

    // Upload Files Flow
    InputUploadFiles : "InputUploadFiles",
    InputExternalLinks : "InputExternalLinks",
    InputProductName : "InputProductName",
    InputProductType : "InputProductType",
    InputPriceConfig : "InputPriceConfig",
    InputLegenPriceConfig : "InputLegenPriceConfig",
    InputRarePriceConfig : "InputRarePriceConfig",
    InputBundlePriceConfig : "InputBundlePriceConfig",
    InputFreePriceConfig : "InputFreePriceConfig",
    InitUploadReducer : "InitUploadReducer",
    UploadedProduct : "UploadedProduct",
    UpdateUploadProgress : "UpdateUploadProgress",
    UpdateUploadedCount : "UpdateUploadedCount",
    UploadLoading : "UploadLoading",

    // Profile Screen Flow
    UpdateProfileMessage : "UpdateProfileMessage",
    LoadingProductsList : "LoadingProductsList",
    UserAllNFTs : "UserAllNFTs" ,
    UserAllProducts : "UserAllProducts",
    UserAccountInfo : "UserAccountInfo",


    // SOLSCloud Flow
    DocumentFiles : "DocumentFiles",
    VideoFiles : "VideoFiles",
    AudioFiles : "AudioFiles",
    ImageFiles : "ImageFiles",
    CloudUploadFiles: "CloudUploadFiles",
    CloudPurchaseFiles : "CloudPurchaseFiles",

    // Cart Flow
    UserBidsInfoList : "UserBidsInfoList",
    UserTxsInfoList : "UserTxsInfoList",
    UserOrdersInfoList : "UserOrdersInfoList",

    // Setting Flow
    ExpandedItem : "ExpandedItem",
    UserStripeInfo : "UserStripeInfo",

    // Customers Flow 
    FetchCustomersList : "FetchCustomersList",
    AddNewCustomer : "AddNewCustomer",

    // Notify Flow
    FetchAllNotify : "FetchAllNotify",

    // Transaction Flow
    AllTxsList : "AllTxsList",


    // Profile Link Flow
    SellerProfileInfo : "SellerProfileInfo",
    LoadingSellerProductsList : "LoadingSellerProductsList",
    LoadingProfileLink : "LoadingProfileLink",
    SellerAllProducts : "SellerAllProducts",
    InitLinkReducer : "InitLinkReducer",
    LoadingBuyTransaction : "LoadingBuyTransaction",
    ConnectLinkToAccount : "ConnectLinkToAccount",
    LoadingLegendaryTx:"LoadingLegendaryTx",
    LoadingBundleTx : "LoadingBundleTx",
    InitUrlFromLink : "InitUrlFromLink",

    // Visit SOLS Product Flow
    ProductPageInfo : "ProductPageInfo",
    CheckingProductUrl : "CheckingProductUrl",
    InitSOLInfo : "InitSOLInfo"
}

export default ActionTypes ;