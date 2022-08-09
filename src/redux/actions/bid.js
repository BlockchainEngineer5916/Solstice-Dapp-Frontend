
import ActionTypes from "./actionTypes";

import { db } from "../../firebase/config";
import { doc, getDoc, updateDoc, getDocs, query, collection, where, addDoc, increment } from 'firebase/firestore' ;
import { getCookie, getProductId, setCookie, getUuid } from "../../utils/Helper";

import axios from "axios";
import { ipfs_origin } from "../../constants/static";

import { v4 as uuidv4 } from 'uuid' ;

import emailjs from 'emailjs-com';

