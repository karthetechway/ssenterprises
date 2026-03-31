
'use strict';
/* ════════════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════════════ */
/* Credentials stored ONLY in localStorage - never in source code.
   First visit: user must set password via setup screen. */
let ADMIN_U = localStorage.getItem('kc_admin_u') || '';
let ADMIN_P = localStorage.getItem('kc_admin_p') || '';
let SESSION_ACTIVE = false;
let IDLE_TIMER = null;
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/* Clean SVG thumbnails — NO watermarks, NO external CDN */
const CAT_IMG = {
  'Electric Crackers': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjQjgyODBBIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRTg0NTBGIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfp6g8L3RleHQ+PC9zdmc+',
  'Chorsa': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjQzAzOTJCIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRTc0QzNDIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfkqU8L3RleHQ+PC9zdmc+',
  'Giant Crackers': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjN0IyRDhCIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOUI1OUI2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfkqM8L3RleHQ+PC9zdmc+',
  'Bijili': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRDRBQzBEIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRjREMDNGIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPuKaoTwvdGV4dD48L3N2Zz4=',
  'Deluxe Crackers': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjQTkzMjI2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjQ0I0MzM1Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfjoc8L3RleHQ+PC9zdmc+',
  'Flower Pots': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMUU4NDQ5Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMjdBRTYwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfjLg8L3RleHQ+PC9zdmc+',
  'Ground Chakkar': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMUE1Mjc2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMkU4NkMxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfjIA8L3RleHQ+PC9zdmc+',
  'Bombs': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMUMyODMzIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMkMzRTUwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfkqM8L3RleHQ+PC9zdmc+',
  'Paper Bomb': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNkUyRjFBIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOTM1MTE2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfk6Y8L3RleHQ+PC9zdmc+',
  'Twinkling & Pencil': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNkMzNDgzIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOEU0NEFEIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPuKtkDwvdGV4dD48L3N2Zz4=',
  'Toys & Stone': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMEU2NjU1Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTdBNTg5Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfjq88L3RleHQ+PC9zdmc+',
  'Rockets': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTcyMDJBIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMjEyRjNEIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfmoA8L3RleHQ+PC9zdmc+',
  'Wala Garlands': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjQjAzQTJFIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRTkxRTYzIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfjoA8L3RleHQ+PC9zdmc+',
  'Shots': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjQkE0QTAwIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRDM1NDAwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfjoY8L3RleHQ+PC9zdmc+',
  'Single Shot': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNzY0NDhBIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOUI1OUI2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfjJ88L3RleHQ+PC9zdmc+',
  'Whistling Shot': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMEU2MjUxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTdBNTg5Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfjrU8L3RleHQ+PC9zdmc+',
  'Set Out': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMUEyMzdFIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMjgzNTkzIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfk7o8L3RleHQ+PC9zdmc+',
  'Fancy Fountain': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDA2OTVDIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDA4OTdCIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPuKbsjwvdGV4dD48L3N2Zz4=',
  'Sparklers': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjQjc5NTBCIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRDRBQzBEIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPuKcqDwvdGV4dD48L3N2Zz4=',
  'Net Rate': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNEQ1NjU2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNjE2QTZCIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI0MCIgeT0iNTQiIGZvbnQtc2l6ZT0iMzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcHBsZSBDb2xvciBFbW9qaSxTZWdvZSBVSSBFbW9qaSxOb3RvIENvbG9yIEVtb2ppLHNhbnMtc2VyaWYiPvCfp648L3RleHQ+PC9zdmc+',
};

/* Same image pipeline as shop: ../images/crackers/{id}.jpg → category URL → SVG */

const JGBASE = "https://jaiganeshcrackers.com/image/Crackers/";
const CAT_DEFAULT_IMG = {
  'Electric Crackers':  JGBASE+'34.jpg',
  'Chorsa':             JGBASE+'32.jpg',
  'Giant Crackers':     JGBASE+'50.jpg',
  'Bijili':             JGBASE+'410.jpg',
  'Deluxe Crackers':    JGBASE+'37.jpg',
  'Flower Pots':        JGBASE+'online-crackers-flowerpots-big.webp',
  'Ground Chakkar':     JGBASE+'25.jpg',
  'Bombs':              JGBASE+'47.jpg',
  'Paper Bomb':         JGBASE+'20230712_115338-removebg-preview.webp',
  'Twinkling & Pencil': JGBASE+'online-crackers-tstar.webp',
  'Toys & Stone':       JGBASE+'209.jpg',
  'Rockets':            JGBASE+'42.jpg',
  'Wala Garlands':      JGBASE+'426.jpg',
  'Shots':              JGBASE+'online-crackers-seven-shots.webp',
  'Single Shot':        JGBASE+'100.jpg',
  'Whistling Shot':     JGBASE+'109.jpg',
  'Set Out':            JGBASE+'111.jpg',
  'Fancy Fountain':     JGBASE+'online-crackers-drone.webp',
  'Sparklers':          JGBASE+'2.jpg',
  'Net Rate':           JGBASE+'393.jpg',
};
const LOCAL_IMG_PREFIX = '../images/crackers/';
const PRODUCT_IMG_HINT = {};

function getProductImg(p){
  if(p.img && p.img.trim()) return p.img.trim();
  if(PRODUCT_IMG_HINT[p.id]) return LOCAL_IMG_PREFIX + PRODUCT_IMG_HINT[p.id];
  return LOCAL_IMG_PREFIX + p.id + '.jpg';
}

function handleImgErr(img){
  const cat = decodeURIComponent(img.dataset.cat || '');
  const step = img.dataset.imgStep || '0';
  img.onerror = null;
  if(step === '0'){
    img.dataset.imgStep = '1';
    img.onerror = handleImgErr;
    img.src = CAT_DEFAULT_IMG[cat] || (JGBASE + '34.jpg');
    return;
  }
  img.dataset.imgStep = '2';
  img.src = CAT_IMG[cat] || CAT_IMG['Net Rate'] || '';
  img.classList.add('v');
}

function doLogin(){
  // First run: no credentials set yet → show setup
  if(!ADMIN_U || !ADMIN_P){
    document.getElementById('loginSubMsg').textContent = 'First visit — create your admin password below.';
    showSetup(); return;
  }
  const u = document.getElementById('lu').value.trim();
  const p = document.getElementById('lp').value;
  if(u === ADMIN_U && p === ADMIN_P){
    SESSION_ACTIVE = true;
    document.getElementById('lw').classList.add('gone');
    document.getElementById('app').style.display = 'flex';
    loadAll(); goPage('dash');
    startIdleTimer();
  } else {
    const errEl = document.getElementById('le');
    errEl.textContent = '⚠️ Incorrect username or password.';
    errEl.style.color = 'var(--red)';
    errEl.style.display = 'block';
    document.getElementById('lp').value = '';
    document.getElementById('lp').focus();
    // Anti-brute-force: disable the login button briefly
    const btn = document.getElementById('loginBtn');
    if(btn){ btn.disabled = true; setTimeout(()=>{ btn.disabled = false; }, 1800); }
  }
}
function doLogout(){
  SESSION_ACTIVE = false;
  clearIdleTimer();
  document.getElementById('lu').value = '';
  document.getElementById('lp').value = '';
  const errEl = document.getElementById('le');
  errEl.style.display = 'none';
  document.getElementById('lw').classList.remove('gone');
  document.getElementById('app').style.display = 'none';
}

/* ── IDLE AUTO-LOCK (10 minutes) ── */
function startIdleTimer(){
  clearIdleTimer();
  IDLE_TIMER = setTimeout(()=>{
    if(SESSION_ACTIVE){
      doLogout();
      const errEl = document.getElementById('le');
      errEl.textContent = '🔒 Session locked after 10 minutes of inactivity.';
      errEl.style.color = '#F59E0B';
      errEl.style.display = 'block';
    }
  }, IDLE_TIMEOUT_MS);
}
function clearIdleTimer(){
  if(IDLE_TIMER){ clearTimeout(IDLE_TIMER); IDLE_TIMER = null; }
}
function resetIdleTimer(){
  if(SESSION_ACTIVE) startIdleTimer();
}
['click','keydown','mousemove','scroll','touchstart'].forEach(evt=>{
  document.addEventListener(evt, resetIdleTimer, {passive:true});
});

/* ── FIRST-RUN SETUP ── */
function showSetup(){
  document.getElementById('setupScreen').style.display = 'flex';
  document.getElementById('lw').classList.add('gone');
}
function saveSetup(){
  const u  = document.getElementById('setupUser').value.trim();
  const p  = document.getElementById('setupPass').value;
  const pc = document.getElementById('setupPassC').value;
  const errEl = document.getElementById('setupErr');
  errEl.style.display = 'none';
  if(u.length < 3){ errEl.textContent = 'Username must be at least 3 characters.'; errEl.style.display = 'block'; return; }
  if(p.length < 8){ errEl.textContent = 'Password must be at least 8 characters.'; errEl.style.display = 'block'; return; }
  if(p !== pc){ errEl.textContent = 'Passwords do not match.'; errEl.style.display = 'block'; return; }
  ADMIN_U = u; ADMIN_P = p;
  localStorage.setItem('kc_admin_u', u);
  localStorage.setItem('kc_admin_p', p);
  document.getElementById('setupScreen').style.display = 'none';
  document.getElementById('lw').classList.remove('gone');
  const loginErr = document.getElementById('le');
  loginErr.textContent = '✅ Password set! Please log in now.';
  loginErr.style.color = 'var(--green)';
  loginErr.style.display = 'block';
}

/** Opens the in-page reset password card */
function openResetCard(){
  const rc = document.getElementById('resetCard');
  if(!rc) return;
  ['resetUser','resetPass','resetPassC'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  const err = document.getElementById('resetErr'); if(err){ err.textContent=''; err.style.display='none'; }
  rc.style.display = 'flex';
}
function closeResetCard(){
  const rc = document.getElementById('resetCard');
  if(rc) rc.style.display = 'none';
}
function saveReset(){
  const u  = (document.getElementById('resetUser')?.value||'').trim();
  const p  = document.getElementById('resetPass')?.value||'';
  const pc = document.getElementById('resetPassC')?.value||'';
  const errEl = document.getElementById('resetErr');
  errEl.textContent = ''; errEl.style.display = 'none';
  if(u.length < 3){ errEl.textContent = 'Username must be at least 3 characters.'; errEl.style.display = 'block'; return; }
  if(p.length < 8){ errEl.textContent = 'Password must be at least 8 characters.'; errEl.style.display = 'block'; return; }
  if(p !== pc){ errEl.textContent = 'Passwords do not match.'; errEl.style.display = 'block'; return; }
  ADMIN_U = u; ADMIN_P = p;
  localStorage.setItem('kc_admin_u', u);
  localStorage.setItem('kc_admin_p', p);
  closeResetCard();
  const loginErr = document.getElementById('le');
  loginErr.textContent = '✅ Password updated! Please sign in with your new credentials.';
  loginErr.style.color = 'var(--green)';
  loginErr.style.display = 'block';
  document.getElementById('lu').value = u;
  document.getElementById('lp').value = '';
  document.getElementById('lp').focus();
}

/** Legacy compat: keeps forgotAdminPassword so any old bookmarks still work */
function forgotAdminPassword(){ openResetCard(); }



/* ════ FULL 172-PRODUCT DEFAULT LIST ════ */
const DEFAULT_PRODUCTS=[
  {id:1,cat:'Electric Crackers',name:'6" Lakshmi',price:100,per:'1 Pkt',e:'🧨',img:'',inStock:true},
  {id:2,cat:'Electric Crackers',name:'5" Lakshmi',price:80,per:'1 Pkt',e:'🧨',img:'',inStock:true},
  {id:3,cat:'Electric Crackers',name:'4" Super Deluxe Lakshmi',price:55,per:'1 Pkt',e:'🧨',img:'',inStock:true},
  {id:4,cat:'Electric Crackers',name:'4" Deluxe Lakshmi',price:50,per:'1 Pkt',e:'🧨',img:'',inStock:true},
  {id:5,cat:'Electric Crackers',name:'4" Lakshmi Crackers',price:30,per:'1 Pkt',e:'🧨',img:'',inStock:true},
  {id:6,cat:'Electric Crackers',name:'3½" Lakshmi',price:24,per:'1 Pkt',e:'🧨',img:'',inStock:true},
  {id:7,cat:'Electric Crackers',name:'2¾" Kuruvi',price:16,per:'1 Pkt',e:'🧨',img:'',inStock:true},
  {id:8,cat:'Electric Crackers',name:'2 Sound Crackers',price:40,per:'1 Pkt',e:'🧨',img:'',inStock:true},
  {id:9,cat:'Electric Crackers',name:'3 Sound Crackers',price:60,per:'1 Pkt',e:'🧨',img:'',inStock:true},
  {id:10,cat:'Chorsa',name:'28 Chorsa',price:20,per:'1 Pkt',e:'💥',img:'',inStock:true},
  {id:11,cat:'Chorsa',name:'56 Chorsa',price:40,per:'1 Pkt',e:'💥',img:'',inStock:true},
  {id:12,cat:'Giant Crackers',name:'28 Giant',price:40,per:'1 Pkt',e:'💣',img:'',inStock:true},
  {id:13,cat:'Giant Crackers',name:'56 Giant',price:70,per:'1 Pkt',e:'💣',img:'',inStock:true},
  {id:14,cat:'Bijili',name:'Red Bijili',price:50,per:'1 Bag',e:'⚡',img:'',inStock:true},
  {id:15,cat:'Bijili',name:'Stripped Bijili',price:60,per:'1 Bag',e:'⚡',img:'',inStock:true},
  {id:16,cat:'Deluxe Crackers',name:'24 Deluxe',price:70,per:'1 Pkt',e:'🎇',img:'',inStock:true},
  {id:17,cat:'Deluxe Crackers',name:'50 Deluxe',price:160,per:'1 Pkt',e:'🎇',img:'',inStock:true},
  {id:18,cat:'Deluxe Crackers',name:'100 Deluxe',price:350,per:'1 Pkt',e:'🎇',img:'',inStock:true},
  {id:19,cat:'Flower Pots',name:'Flower Pots Small',price:70,per:'1 Box',e:'🌸',img:'',inStock:true},
  {id:20,cat:'Flower Pots',name:'Flower Pots Big',price:100,per:'1 Box',e:'🌸',img:'',inStock:true},
  {id:21,cat:'Flower Pots',name:'Flower Pots Special',price:120,per:'1 Box',e:'🌸',img:'',inStock:true},
  {id:22,cat:'Flower Pots',name:'Flower Pots Asoka',price:180,per:'1 Box',e:'🌸',img:'',inStock:true},
  {id:23,cat:'Flower Pots',name:'Flower Pots Deluxe (5 Pcs)',price:300,per:'1 Box',e:'🌸',img:'',inStock:true},
  {id:24,cat:'Flower Pots',name:'Flower Pots Super Dlx',price:160,per:'1 Box',e:'🌸',img:'',inStock:true},
  {id:25,cat:'Flower Pots',name:'Colour Kotti I',price:400,per:'1 Box',e:'🌺',img:'',inStock:true},
  {id:26,cat:'Flower Pots',name:'Colour Kotti II',price:300,per:'1 Box',e:'🌺',img:'',inStock:true},
  {id:27,cat:'Flower Pots',name:'Colour Kotti Deluxe',price:700,per:'1 Box',e:'🌺',img:'',inStock:true},
  {id:28,cat:'Flower Pots',name:'Lucky (5 Pcs)',price:300,per:'1 Box',e:'🍀',img:'',inStock:true},
  {id:29,cat:'Flower Pots',name:'Tri Colour (5 Pcs)',price:500,per:'1 Box',e:'🇮🇳',img:'',inStock:true},
  {id:30,cat:'Ground Chakkar',name:'Chakkar Big (10 Pcs)',price:50,per:'1 Box',e:'🌀',img:'',inStock:true},
  {id:31,cat:'Ground Chakkar',name:'Chakkar Big (25 Pcs)',price:120,per:'1 Box',e:'🌀',img:'',inStock:true},
  {id:32,cat:'Ground Chakkar',name:'Chakkar Asoka',price:90,per:'1 Box',e:'🌀',img:'',inStock:true},
  {id:33,cat:'Ground Chakkar',name:'Chakkar Special',price:100,per:'1 Box',e:'🌀',img:'',inStock:true},
  {id:34,cat:'Ground Chakkar',name:'Chakkar Deluxe',price:180,per:'1 Box',e:'🌀',img:'',inStock:true},
  {id:35,cat:'Ground Chakkar',name:'Disco Wheel',price:200,per:'1 Box',e:'💫',img:'',inStock:true},
  {id:36,cat:'Ground Chakkar',name:'Whistling Wheel',price:250,per:'1 Box',e:'💫',img:'',inStock:true},
  {id:37,cat:'Bombs',name:'Bullet Bomb',price:40,per:'1 Box',e:'💣',img:'',inStock:true},
  {id:38,cat:'Bombs',name:'Atom Bomb Big',price:70,per:'1 Box',e:'💣',img:'',inStock:true},
  {id:39,cat:'Bombs',name:'Hydro Bomb',price:90,per:'1 Box',e:'💣',img:'',inStock:true},
  {id:40,cat:'Bombs',name:'King of King',price:120,per:'1 Box',e:'👑',img:'',inStock:true},
  {id:41,cat:'Bombs',name:'Classic Bomb',price:140,per:'1 Box',e:'💣',img:'',inStock:true},
  {id:42,cat:'Bombs',name:'Deluxe Bomb',price:300,per:'1 Box',e:'💣',img:'',inStock:true},
  {id:43,cat:'Bombs',name:'King Rider',price:400,per:'1 Box',e:'👑',img:'',inStock:true},
  {id:44,cat:'Paper Bomb',name:'¼ Kg Paper Bomb',price:100,per:'1 Box',e:'📦',img:'',inStock:true},
  {id:45,cat:'Paper Bomb',name:'½ Kg Paper Bomb',price:200,per:'1 Box',e:'📦',img:'',inStock:true},
  {id:46,cat:'Paper Bomb',name:'1 Kg Paper Bomb',price:400,per:'1 Box',e:'📦',img:'',inStock:true},
  {id:47,cat:'Paper Bomb',name:'Avatar II (10 Pcs)',price:700,per:'1 Box',e:'🦸',img:'',inStock:true},
  {id:48,cat:'Paper Bomb',name:'Magic Show (2)',price:600,per:'1 Box',e:'🎩',img:'',inStock:true},
  {id:49,cat:'Twinkling & Pencil',name:'Twinkling Star',price:40,per:'1 Box',e:'⭐',img:'',inStock:true},
  {id:50,cat:'Twinkling & Pencil',name:'Twinkling Star Deluxe',price:110,per:'1 Box',e:'⭐',img:'',inStock:true},
  {id:51,cat:'Twinkling & Pencil',name:'7" Pencil',price:40,per:'1 Box',e:'✏️',img:'',inStock:true},
  {id:52,cat:'Twinkling & Pencil',name:'10" Deluxe Pencil',price:80,per:'1 Box',e:'✏️',img:'',inStock:true},
  {id:53,cat:'Twinkling & Pencil',name:'12" Pencil',price:100,per:'1 Box',e:'✏️',img:'',inStock:true},
  {id:54,cat:'Twinkling & Pencil',name:'Feather Pencil (3)',price:250,per:'1 Box',e:'🪶',img:'',inStock:true},
  {id:55,cat:'Twinkling & Pencil',name:'Popcorn Pencil (5)',price:300,per:'1 Box',e:'🍿',img:'',inStock:true},
  {id:56,cat:'Twinkling & Pencil',name:'Sivakasi Special (2)',price:350,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:57,cat:'Toys & Stone',name:'Cartoon Box',price:20,per:'1 Box',e:'📦',img:'',inStock:true},
  {id:58,cat:'Toys & Stone',name:'Stone',price:15,per:'1 Box',e:'🪨',img:'',inStock:true},
  {id:59,cat:'Toys & Stone',name:'Chit Put I',price:50,per:'1 Box',e:'🎯',img:'',inStock:true},
  {id:60,cat:'Toys & Stone',name:'Chit Put II',price:40,per:'1 Box',e:'🎯',img:'',inStock:true},
  {id:61,cat:'Toys & Stone',name:'Chit Put Deluxe',price:80,per:'1 Box',e:'🎯',img:'',inStock:true},
  {id:62,cat:'Rockets',name:'Baby Rocket',price:50,per:'1 Box',e:'🚀',img:'',inStock:true},
  {id:63,cat:'Rockets',name:'Rocket Bomb',price:90,per:'1 Box',e:'🚀',img:'',inStock:true},
  {id:64,cat:'Rockets',name:'Lunik Express',price:150,per:'1 Box',e:'🚀',img:'',inStock:true},
  {id:65,cat:'Rockets',name:'2 Sound Rocket',price:160,per:'1 Box',e:'🚀',img:'',inStock:true},
  {id:66,cat:'Rockets',name:'3 Sound Rocket',price:180,per:'1 Box',e:'🚀',img:'',inStock:true},
  {id:67,cat:'Rockets',name:'Whistling Rocket',price:350,per:'1 Box',e:'🚀',img:'',inStock:true},
  {id:68,cat:'Wala Garlands',name:'100 Wala',price:60,per:'1 Box',e:'🎀',img:'',inStock:true},
  {id:69,cat:'Wala Garlands',name:'200 Wala',price:120,per:'1 Box',e:'🎀',img:'',inStock:true},
  {id:70,cat:'Wala Garlands',name:'300 Wala',price:200,per:'1 Box',e:'🎀',img:'',inStock:true},
  {id:71,cat:'Wala Garlands',name:'600 Wala',price:350,per:'1 Box',e:'🎀',img:'',inStock:true},
  {id:72,cat:'Wala Garlands',name:'1000 Wala',price:500,per:'1 Box',e:'🎀',img:'',inStock:true},
  {id:73,cat:'Wala Garlands',name:'2000 Wala',price:1000,per:'1 Box',e:'🎀',img:'',inStock:true},
  {id:74,cat:'Wala Garlands',name:'5000 Wala',price:2500,per:'1 Box',e:'🎀',img:'',inStock:true},
  {id:75,cat:'Wala Garlands',name:'10000 Wala',price:5000,per:'1 Box',e:'🎀',img:'',inStock:true},
  {id:76,cat:'Shots',name:'7 Shot (5 Pcs)',price:200,per:'1 Box',e:'🎆',img:'',inStock:true},
  {id:77,cat:'Shots',name:'Laka Laka',price:300,per:'1 Box',e:'🎆',img:'',inStock:true},
  {id:78,cat:'Shots',name:'12 Shot',price:250,per:'1 Box',e:'🎆',img:'',inStock:true},
  {id:79,cat:'Shots',name:'25 Shot',price:500,per:'1 Box',e:'🎆',img:'',inStock:true},
  {id:80,cat:'Shots',name:'30 Shot',price:700,per:'1 Box',e:'🎆',img:'',inStock:true},
  {id:81,cat:'Shots',name:'50 Shot',price:1100,per:'1 Box',e:'🎆',img:'',inStock:true},
  {id:82,cat:'Shots',name:'60 Shot',price:1400,per:'1 Box',e:'🎆',img:'',inStock:true},
  {id:83,cat:'Shots',name:'Tittanic 60 Shot',price:2000,per:'1 Box',e:'🎆',img:'',inStock:true},
  {id:84,cat:'Shots',name:'120 Shot',price:2600,per:'1 Box',e:'🎆',img:'',inStock:true},
  {id:85,cat:'Shots',name:'240 Shot',price:5000,per:'1 Box',e:'🎆',img:'',inStock:true},
  {id:86,cat:'Shots',name:'520 Shot',price:12000,per:'1 Box',e:'🎆',img:'',inStock:true},
  {id:87,cat:'Single Shot',name:'1" Chotta Fancy',price:90,per:'1 Box',e:'🌟',img:'',inStock:true},
  {id:88,cat:'Single Shot',name:'2" Colour Fancy',price:180,per:'1 Box',e:'🌟',img:'',inStock:true},
  {id:89,cat:'Single Shot',name:'3 Pcs Fancy',price:500,per:'1 Box',e:'🌟',img:'',inStock:true},
  {id:90,cat:'Single Shot',name:'2½" Colour Fancy',price:200,per:'1 Box',e:'🌟',img:'',inStock:true},
  {id:91,cat:'Single Shot',name:'3" Colour Fancy',price:400,per:'1 Box',e:'🌟',img:'',inStock:true},
  {id:92,cat:'Single Shot',name:'3½" Colour Fancy',price:500,per:'1 Box',e:'🌟',img:'',inStock:true},
  {id:93,cat:'Single Shot',name:'3½" Double Ball',price:700,per:'1 Box',e:'🌟',img:'',inStock:true},
  {id:94,cat:'Single Shot',name:'4" Fancy',price:800,per:'1 Box',e:'🌟',img:'',inStock:true},
  {id:95,cat:'Single Shot',name:'3½" Gun Out',price:500,per:'1 Box',e:'🌟',img:'',inStock:true},
  {id:96,cat:'Whistling Shot',name:'Sweet-16',price:600,per:'1 Box',e:'🎵',img:'',inStock:true},
  {id:97,cat:'Whistling Shot',name:'25 Shot Whistling',price:1200,per:'1 Box',e:'🎵',img:'',inStock:true},
  {id:98,cat:'Whistling Shot',name:'50 Shot Whistling',price:2500,per:'1 Box',e:'🎵',img:'',inStock:true},
  {id:99,cat:'Whistling Shot',name:'100 Shot Whistling',price:4000,per:'1 Box',e:'🎵',img:'',inStock:true},
  {id:100,cat:'Set Out',name:'Univer Cell 2½" (30 Shot)',price:7000,per:'1 Box',e:'📺',img:'',inStock:true},
  {id:101,cat:'Set Out',name:'Bharatha Rathana (20 Shot)',price:4000,per:'1 Box',e:'🇮🇳',img:'',inStock:true},
  {id:102,cat:'Set Out',name:'Black Berry 2" (36 Shot)',price:7000,per:'1 Box',e:'📺',img:'',inStock:true},
  {id:103,cat:'Set Out',name:'Black Thunder 3½" (20 Shot)',price:8000,per:'1 Box',e:'⛈️',img:'',inStock:true},
  {id:104,cat:'Set Out',name:'5 Star 3" (30 Shot)',price:11000,per:'1 Box',e:'⭐',img:'',inStock:true},
  {id:105,cat:'Fancy Fountain',name:'Coin',price:150,per:'1 Box',e:'🪙',img:'',inStock:true},
  {id:106,cat:'Fancy Fountain',name:'Kinder Joy (5 in 1)',price:500,per:'1 Box',e:'🎨',img:'',inStock:true},
  {id:107,cat:'Fancy Fountain',name:'Holi (5 Pcs)',price:300,per:'1 Box',e:'🌈',img:'',inStock:true},
  {id:108,cat:'Fancy Fountain',name:'Star Drum',price:200,per:'1 Box',e:'🥁',img:'',inStock:true},
  {id:109,cat:'Fancy Fountain',name:'Cock Tail (3 Pcs)',price:500,per:'1 Box',e:'🍸',img:'',inStock:true},
  {id:110,cat:'Fancy Fountain',name:'Butterfly',price:150,per:'1 Box',e:'🦋',img:'',inStock:true},
  {id:111,cat:'Fancy Fountain',name:'Photo Flash',price:150,per:'1 Box',e:'📸',img:'',inStock:true},
  {id:112,cat:'Fancy Fountain',name:'Siren',price:250,per:'1 Box',e:'🚨',img:'',inStock:true},
  {id:113,cat:'Fancy Fountain',name:'Ganga Jamuna',price:120,per:'1 Box',e:'🏞️',img:'',inStock:true},
  {id:114,cat:'Fancy Fountain',name:'Pentagon',price:300,per:'1 Box',e:'⭐',img:'',inStock:true},
  {id:115,cat:'Fancy Fountain',name:'Sky Shot (6)',price:200,per:'1 Box',e:'🌌',img:'',inStock:true},
  {id:116,cat:'Fancy Fountain',name:'Holy Nite (6)',price:350,per:'1 Box',e:'🌙',img:'',inStock:true},
  {id:117,cat:'Fancy Fountain',name:'Nestle (5)',price:350,per:'1 Box',e:'☕',img:'',inStock:true},
  {id:118,cat:'Fancy Fountain',name:'Choconz (2)',price:350,per:'1 Box',e:'🍫',img:'',inStock:true},
  {id:119,cat:'Fancy Fountain',name:'Pambaram (10)',price:200,per:'1 Box',e:'🌀',img:'',inStock:true},
  {id:120,cat:'Fancy Fountain',name:'Crackling King',price:350,per:'1 Box',e:'👑',img:'',inStock:true},
  {id:121,cat:'Fancy Fountain',name:'Wonder Tree',price:350,per:'1 Box',e:'🌳',img:'',inStock:true},
  {id:122,cat:'Fancy Fountain',name:'Rainbow Smoke',price:400,per:'1 Box',e:'🌈',img:'',inStock:true},
  {id:123,cat:'Fancy Fountain',name:'4x4 Fancy Wheel',price:300,per:'1 Box',e:'🎡',img:'',inStock:true},
  {id:124,cat:'Fancy Fountain',name:'4" Fountain',price:200,per:'1 Box',e:'⛲',img:'',inStock:true},
  {id:125,cat:'Fancy Fountain',name:'6" Fountain',price:300,per:'1 Box',e:'⛲',img:'',inStock:true},
  {id:126,cat:'Fancy Fountain',name:'Temple Run',price:700,per:'1 Box',e:'🏛️',img:'',inStock:true},
  {id:127,cat:'Fancy Fountain',name:'Lollypop Pencil (5)',price:400,per:'1 Box',e:'🍭',img:'',inStock:true},
  {id:128,cat:'Fancy Fountain',name:'Holi Copter',price:150,per:'1 Box',e:'🚁',img:'',inStock:true},
  {id:129,cat:'Fancy Fountain',name:'Drone',price:300,per:'1 Box',e:'🛸',img:'',inStock:true},
  {id:130,cat:'Fancy Fountain',name:'Mini Peacock',price:200,per:'1 Box',e:'🦚',img:'',inStock:true},
  {id:131,cat:'Fancy Fountain',name:'Medium Peacock',price:350,per:'1 Box',e:'🦚',img:'',inStock:true},
  {id:132,cat:'Fancy Fountain',name:'Bada Peacock',price:800,per:'1 Box',e:'🦚',img:'',inStock:true},
  {id:133,cat:'Fancy Fountain',name:'Block Money (5)',price:500,per:'1 Box',e:'💰',img:'',inStock:true},
  {id:134,cat:'Sparklers',name:'7 Cm Electric',price:13,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:135,cat:'Sparklers',name:'7 Cm Colour',price:16,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:136,cat:'Sparklers',name:'7 Cm Green',price:18,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:137,cat:'Sparklers',name:'7 Cm Red',price:20,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:138,cat:'Sparklers',name:'10 Cm Electric',price:24,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:139,cat:'Sparklers',name:'10 Cm Colour',price:30,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:140,cat:'Sparklers',name:'10 Cm Green',price:36,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:141,cat:'Sparklers',name:'10 Cm Red',price:40,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:142,cat:'Sparklers',name:'12 Cm Electric',price:40,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:143,cat:'Sparklers',name:'12 Cm Colour',price:44,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:144,cat:'Sparklers',name:'12 Cm Green',price:48,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:145,cat:'Sparklers',name:'12 Cm Red',price:50,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:146,cat:'Sparklers',name:'15 Cm Electric',price:66,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:147,cat:'Sparklers',name:'15 Cm Colour',price:70,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:148,cat:'Sparklers',name:'15 Cm Green',price:76,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:149,cat:'Sparklers',name:'15 Cm Red',price:80,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:150,cat:'Sparklers',name:'30 Cm Electric',price:66,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:151,cat:'Sparklers',name:'30 Cm Colour',price:70,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:152,cat:'Sparklers',name:'30 Cm Green',price:76,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:153,cat:'Sparklers',name:'30 Cm Red',price:80,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:154,cat:'Sparklers',name:'50 Cm Electric',price:250,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:155,cat:'Sparklers',name:'50 Cm Colour',price:300,per:'1 Box',e:'✨',img:'',inStock:true},
  {id:156,cat:'Net Rate',name:'Short Count 1000 Wala',price:150,per:'1 Box',e:'🧮',img:'',inStock:true},
  {id:157,cat:'Net Rate',name:'Medium Count 1000 Wala',price:200,per:'1 Box',e:'🧮',img:'',inStock:true},
  {id:158,cat:'Net Rate',name:'Short Count 2000 Wala',price:300,per:'1 Box',e:'🧮',img:'',inStock:true},
  {id:159,cat:'Net Rate',name:'Medium Count 2000 Wala',price:400,per:'1 Box',e:'🧮',img:'',inStock:true},
  {id:160,cat:'Net Rate',name:'Short Count 5000 Wala',price:750,per:'1 Box',e:'🧮',img:'',inStock:true},
  {id:161,cat:'Net Rate',name:'Medium Count 5000 Wala',price:1000,per:'1 Box',e:'🧮',img:'',inStock:true},
  {id:162,cat:'Net Rate',name:'Short Count 10000 Wala',price:1500,per:'1 Box',e:'🧮',img:'',inStock:true},
  {id:163,cat:'Net Rate',name:'Medium Count 10000 Wala',price:2000,per:'1 Box',e:'🧮',img:'',inStock:true},
  {id:164,cat:'Net Rate',name:'Serpent Small',price:120,per:'1 Unit',e:'🐍',img:'',inStock:true},
  {id:165,cat:'Net Rate',name:'Serpent Big',price:150,per:'1 Unit',e:'🐍',img:'',inStock:true},
  {id:166,cat:'Net Rate',name:'Roll Cap',price:35,per:'1 Unit',e:'🔫',img:'',inStock:true},
  {id:167,cat:'Net Rate',name:'Deluxe Matches',price:30,per:'1 Unit',e:'🔥',img:'',inStock:true},
  {id:168,cat:'Net Rate',name:'Super Deluxe Matches',price:50,per:'1 Unit',e:'🔥',img:'',inStock:true},
  {id:169,cat:'Net Rate',name:'Lamba Matches',price:70,per:'1 Unit',e:'🔥',img:'',inStock:true},
  {id:170,cat:'Net Rate',name:'Lamba Matches (Laptap)',price:100,per:'1 Unit',e:'🔥',img:'',inStock:true},
  {id:171,cat:'Net Rate',name:'Mega Matches',price:130,per:'1 Unit',e:'🔥',img:'',inStock:true},
  {id:172,cat:'Net Rate',name:'Mega Matches (Laptap)',price:200,per:'1 Unit',e:'🔥',img:'',inStock:true},
];

function loadAll(){
  /* Products: try localStorage first, fall back to full 172-item default */
  const sp = localStorage.getItem('kc_products');
  try { products = sp ? JSON.parse(sp) : DEFAULT_PRODUCTS.map(p=>({...p})); }
  catch(e){ products = DEFAULT_PRODUCTS.map(p=>({...p})); }

  const so = localStorage.getItem('kc_orders');
  try { orders = so ? JSON.parse(so) : []; }
  catch(e){ orders = []; }
  if(!orders.length) seedDemo();

  renderDash(); renderOrders(); renderProds(); renderStock(); renderReports(); renderSettingsDisplay();
  syncTaxInvoices(); // Auto-generate tax invoices for all orders
}
function saveProdList(){
  localStorage.setItem('kc_products', JSON.stringify(products));
  localStorage.setItem('kc_products_ts', Date.now()); // signal shop tab
}
function saveOrderList(){
  localStorage.setItem('kc_orders', JSON.stringify(orders));
  // Auto-generate tax invoices for any orders that don't have one yet
  orders.forEach(o=>generateTaxInvoicesForOrder(o));
}

/* ────────────────────────────────────────────────────── */
function seedDemo(){
  orders = [
    {id:'KC2203AAA',name:'Ramesh Kumar',phone:'9876543210',email:'ramesh@gmail.com',
     address:'12 Main St, Chennai 600001',payment:'Bank Transfer',notes:'',
     items:[{id:82,name:'60 Shot',qty:3,price:1400,cat:'Shots'},
            {id:20,name:'Flower Pots Big',qty:10,price:100,cat:'Flower Pots'}],
     total:5200,status:'Delivered',date:new Date(Date.now()-7*86400000).toISOString()},
    {id:'KC2203BBB',name:'Priya Devi',phone:'9123456789',email:'priya@yahoo.com',
     address:'5 Park Ave, Coimbatore 641001',payment:'UPI',notes:'Diwali order',
     items:[{id:85,name:'240 Shot',qty:1,price:5000,cat:'Shots'},
            {id:132,name:'Bada Peacock',qty:2,price:800,cat:'Fancy Fountain'}],
     total:6600,status:'Shipped',date:new Date(Date.now()-3*86400000).toISOString()},
    {id:'KC2203CCC',name:'Suresh Babu',phone:'9988776655',email:'suresh@gmail.com',
     address:'78 Gandhi Rd, Madurai 625001',payment:'Bank Transfer',notes:'',
     items:[{id:86,name:'520 Shot',qty:1,price:12000,cat:'Shots'},
            {id:138,name:'10 Cm Electric',qty:20,price:24,cat:'Sparklers'}],
     total:12480,status:'Confirmed',date:new Date(Date.now()-86400000).toISOString()},
    {id:'KC2203DDD',name:'Anitha Raj',phone:'9876501234',email:'anitha@gmail.com',
     address:'33 Rose Lane, Salem 636001',payment:'COD',notes:'',
     items:[{id:132,name:'Bada Peacock',qty:2,price:800,cat:'Fancy Fountain'},
            {id:75,name:'10000 Wala',qty:1,price:5000,cat:'Wala Garlands'}],
     total:6600,status:'New',date:new Date(Date.now()-1800000).toISOString()},
  ];
  saveOrderList();
}

/* ════════════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════════════ */
function goPage(p){
  document.querySelectorAll('[id^="pg-"]').forEach(x=>x.style.display='none');
  document.querySelectorAll('.nb').forEach(x=>x.classList.remove('active'));
  const map={dash:'pg-dash',orders:'pg-orders',new:'pg-orders',proc:'pg-orders',done:'pg-orders',
             products:'pg-products',stock:'pg-stock',settings:'pg-settings',reports:'pg-reports',
             taxinv:'pg-taxinv'};
  const el=document.getElementById(map[p]||'pg-dash');
  if(el) el.style.display='block';
  const nb=document.getElementById('nb-'+p); if(nb) nb.classList.add('active');
  if(document.getElementById('ostat')){
    const sm={new:'New',proc:'Confirmed',done:'Delivered'};
    const tm={new:'🆕 New Orders',proc:'⚙️ Processing',done:'✅ Delivered',orders:'📦 All Orders'};
    document.getElementById('ostat').value = sm[p]||'';
    document.getElementById('ordHdr').textContent = tm[p]||'📦 All Orders';
  }
  if(['orders','new','proc','done'].includes(p)) renderOrders();
  if(p==='dash')     renderDash();
  if(p==='reports')  renderReports();
  if(p==='products') renderProds();
  if(p==='stock')    renderStock();
  if(p==='settings') renderSettingsDisplay();
  if(p==='taxinv')   renderTaxInv();
}

/* ★ View Shop — resolve correct path dynamically so it always opens the right file */
function openShop(){
  const loc = window.location.href;
  // Works for file://, http://, https://
  const shopUrl = loc.replace(/admin[^/]*\.html.*$/, 'index.html');
  window.open(shopUrl, '_blank');
}

/* ════════════════════════════════════════════════════════
   HELPERS — price display (★ FIX #1: system-ui for ₹)
════════════════════════════════════════════════════════ */
function priceHtml(amt, szRs, szNum, cls=''){
  return `<span class="rs ${szRs} ${cls}">₹</span><span class="num-pf ${szNum} ${cls}">${amt.toLocaleString('en-IN')}</span>`;
}
function fmtDate(iso){
  if(!iso) return '-';
  return new Date(iso).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
const SP_CLS={New:'s-new',Confirmed:'s-con',Packed:'s-pak',Shipped:'s-shp',Delivered:'s-del',Cancelled:'s-can'};
const SP_ICO={New:'🆕',Confirmed:'✅',Packed:'📦',Shipped:'🚚',Delivered:'🎉',Cancelled:'❌'};
function spBadge(s){ return `<span class="sp ${SP_CLS[s]||'s-new'}">${SP_ICO[s]||'•'} ${s}</span>`; }

/* Safe text for HTML attribute values — escapes ", & < > */
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escJs(s){ return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n').replace(/\r/g,''); }

/* ════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════ */
function renderDash(){
  const rev = orders.filter(o=>o.status!=='Cancelled').reduce((a,o)=>a+o.total,0);
  const newN = orders.filter(o=>o.status==='New').length;
  const today = orders.filter(o=>new Date(o.date).toDateString()===new Date().toDateString()).length;
  const oos = products.filter(p=>p.inStock===false).length;

  document.getElementById('statsGrid').innerHTML=`
    <div class="sc hi">
      <div class="sc-t"><span class="sc-l">Total Revenue</span><span class="sc-i">💰</span></div>
      <div class="sc-v gld">${priceHtml(rev,'rs-lg','num-xl','gld')}</div>
      <div class="sc-s">${orders.length} orders</div>
    </div>
    <div class="sc">
      <div class="sc-t"><span class="sc-l">New Orders</span><span class="sc-i">🆕</span></div>
      <div class="sc-v bl">${newN}</div><div class="sc-s">Need attention</div>
    </div>
    <div class="sc">
      <div class="sc-t"><span class="sc-l">Today</span><span class="sc-i">📅</span></div>
      <div class="sc-v">${today}</div><div class="sc-s">Orders today</div>
    </div>
    <div class="sc">
      <div class="sc-t"><span class="sc-l">Out of Stock</span><span class="sc-i">⚠️</span></div>
      <div class="sc-v ${oos>0?'rd':'grn'}">${oos}</div><div class="sc-s">Items</div>
    </div>`;

  const rec = orders.slice(0,5);
  document.getElementById('recentTbl').innerHTML = rec.length
    ? `<table class="dt"><thead><tr><th>ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
       <tbody>${rec.map(o=>`<tr>
         <td><span style="font-family:monospace;font-size:.68rem;color:var(--blue);cursor:pointer" onclick="openOrd('${escJs(o.id)}')">${o.id}</span></td>
         <td><div style="font-weight:600;font-size:.75rem">${esc(o.name)}</div><div style="font-size:.65rem;color:var(--muted)">${esc(o.phone)}</div></td>
         <td>${priceHtml(o.total,'rs-sm','num-md')}</td>
         <td>${spBadge(o.status)}</td>
       </tr>`).join('')}</tbody></table>`
    : `<div class="empty-row">No orders yet</div>`;

  const stats=['New','Confirmed','Packed','Shipped','Delivered','Cancelled'];
  document.getElementById('statusBreak').innerHTML = stats.map(s=>{
    const c=orders.filter(o=>o.status===s).length;
    const pct=orders.length?Math.round(c/orders.length*100):0;
    return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      ${spBadge(s)}
      <span style="display:flex;align-items:center;gap:6px">
        <div style="width:64px;height:4px;background:var(--border);border-radius:2px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:var(--gold);border-radius:2px"></div>
        </div>
        <span style="font-weight:700;font-size:.73rem;min-width:14px;text-align:right">${c}</span>
      </span></div>`;
  }).join('');

  const oosItems = products.filter(p=>p.inStock===false).slice(0,5);
  document.getElementById('stockAlerts').innerHTML = oosItems.length
    ? oosItems.map(p=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:.73rem;font-weight:500">${esc(p.name)}</span>
        <span style="display:flex;align-items:center;gap:4px">
          <span class="is oos">Out</span>
          <button class="btn b-grn b-sm" style="padding:2px 7px;font-size:.62rem" onclick="toggleStock(${p.id})">Restock</button>
        </span>
      </div>`).join('')
    : '<div style="font-size:.73rem;color:var(--green);text-align:center">✅ All items in stock</div>';
}

/* ════════════════════════════════════════════════════════
   ORDERS TABLE
════════════════════════════════════════════════════════ */
function renderOrders(){
  let f = [...orders];
  const q  = (document.getElementById('osrch')?.value||'').toLowerCase();
  const st = document.getElementById('ostat')?.value||'';
  const sr = document.getElementById('osrt')?.value||'nd';
  if(q)  f = f.filter(o=>o.id.toLowerCase().includes(q)||o.name.toLowerCase().includes(q)||o.phone.includes(q)||o.email.toLowerCase().includes(q));
  if(st) f = f.filter(o=>o.status===st);
  f.sort((a,b)=>sr==='nd'?new Date(b.date)-new Date(a.date):sr==='od'?new Date(a.date)-new Date(b.date):sr==='hi'?b.total-a.total:a.total-b.total);

  const el=document.getElementById('ocnt'); if(el) el.textContent=f.length+' orders';
  if(!f.length){ document.getElementById('ordersTbl').innerHTML=`<div class="empty-row">No orders found</div>`; return; }

  document.getElementById('ordersTbl').innerHTML=`
    <table class="dt">
      <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${f.map(o=>`<tr>
        <td><span style="font-family:monospace;font-size:.68rem;color:var(--blue);cursor:pointer" onclick="openOrd('${escJs(o.id)}')">${o.id}</span></td>
        <td>
          <div style="font-weight:600;font-size:.75rem">${esc(o.name)}</div>
          <div style="font-size:.64rem;color:var(--muted)">${esc(o.email)}</div>
          <div style="font-size:.64rem;color:var(--muted)">${esc(o.phone)}</div>
        </td>
        <td style="font-size:.7rem;color:var(--sub)">${o.items.length} item(s)</td>
        <td>${priceHtml(o.total,'rs-sm','num-md')}</td>
        <td style="font-size:.7rem">${esc(o.payment)}</td>
        <td style="font-size:.67rem;color:var(--muted)">${fmtDate(o.date)}</td>
        <td>
          <select class="ssel" onchange="updStatus('${escJs(o.id)}',this.value)">
            ${['New','Confirmed','Packed','Shipped','Delivered','Cancelled'].map(s=>`<option${o.status===s?' selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td><div class="acts">
          <button class="ib" onclick="openOrd('${escJs(o.id)}')" title="Edit">✏️</button>
          <button class="ib" onclick="printOrd('${escJs(o.id)}')" title="Print">🖨</button>
          <button class="ib g" onclick="waOrd('${escJs(o.id)}')" title="WhatsApp">💬</button>
          <button class="ib r" onclick="delOrd('${escJs(o.id)}')" title="Delete">🗑</button>
        </div></td>
      </tr>`).join('')}</tbody></table>`;
}

function updStatus(id, s){
  const o=orders.find(x=>x.id===id); if(!o) return;
  o.status=s; saveOrderList(); renderDash(); toast('Status → '+s);
}
function delOrd(id){
  if(!confirm('Delete order '+id+'?')) return;
  orders=orders.filter(o=>o.id!==id); saveOrderList(); loadAll(); toast('Deleted');
}
function waOrd(id){
  const o=orders.find(x=>x.id===id); if(!o) return;
  const items=o.items.map(i=>`• ${i.name} ×${i.qty} = ₹${(i.price*i.qty).toLocaleString('en-IN')}`).join('\n');
  window.open('https://wa.me/'+o.phone.replace(/\D/g,'')+'?text='+encodeURIComponent(
    `🎆 *Update from SS Enterprises*\n\nHi ${o.name}, your order *${o.id}* is now *${o.status}* ✅\n\n📦 Items:\n${items}\n💰 Total: ₹${o.total.toLocaleString('en-IN')}\n\nThank you for shopping with SS Enterprises! 🎆`
  ),'_blank');
}

/* ════════════════════════════════════════════════════════
   ORDER EDITOR — state lives entirely in JS object `editing`
   DOM is only READ at Save time from stable input IDs.
   Item list uses event-delegation on a single container DIV.
   No inline onchange= handlers → no XSS, no stale-value bugs.
════════════════════════════════════════════════════════ */
function openOrd(id){
  const o=orders.find(x=>x.id===id); if(!o) return;
  editing = JSON.parse(JSON.stringify(o));  // deep clone, never mutate original until Save
  buildOrdModal();
  document.getElementById('ordMov').classList.add('show');
}
function closeOrdMov(){
  document.getElementById('ordMov').classList.remove('show');
  editing = null;
}
document.getElementById('ordMov').addEventListener('click', e=>{
  if(e.target===document.getElementById('ordMov')) closeOrdMov();
});

function calcTotal(){ editing.total = editing.items.reduce((a,i)=>a+i.price*i.qty, 0); }

/* Build entire modal body once, then use tiny DOM patches for item changes */
function buildOrdModal(){
  const o = editing;
  document.getElementById('ordModTitle').textContent = 'Edit Order '+o.id;

  // Build static form fields (no onchange= needed — we read them at Save time)
  document.getElementById('ordModBody').innerHTML = `
    <div class="fgr">
      <div class="fg"><label>Customer Name</label><input id="eN" type="text" value="${esc(o.name)}"/></div>
      <div class="fg"><label>Phone</label><input id="ePh" type="tel" value="${esc(o.phone)}"/></div>
    </div>
    <div class="fgr">
      <div class="fg"><label>Email</label><input id="eEm" type="email" value="${esc(o.email)}"/></div>
      <div class="fg"><label>Payment</label>
        <select id="ePy">
          ${['Bank Transfer','UPI','Cash on Delivery'].map(p=>`<option${o.payment===p?' selected':''}>${p}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="fg"><label>Delivery Address</label><input id="eAd" type="text" value="${esc(o.address)}"/></div>
    <div class="fgr">
      <div class="fg"><label>Status</label>
        <select id="eSt">
          ${['New','Confirmed','Packed','Shipped','Delivered','Cancelled'].map(s=>`<option${o.status===s?' selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="fg"><label>Notes</label><input id="eNo" type="text" value="${esc(o.notes||'')}"/></div>
    </div>

    <!-- Item editor (state in editing.items, DOM patches only) -->
    <div class="oie">
      <div class="oie-hd">
        <span>Order Items (${o.items.length})</span>
        <span style="font-size:.62rem;color:rgba(255,255,255,.35)">Edit qty or remove items below</span>
      </div>
      <div class="oie-body" id="oieBody"></div>
      <div class="oie-add">
        <select class="oie-add-sel" id="oieAddSel">
          ${products.map(p=>`<option value="${p.id}">${esc(p.name)} — ₹${p.price}</option>`).join('')}
        </select>
        <button class="oie-add-btn" id="oieAddBtn">+ Add Item</button>
      </div>
      <div class="oie-foot">
        <span>Order Total</span>
        <span id="oieTot">${priceHtml(o.total,'rs-md','num-lg','gold-text')}</span>
      </div>
    </div>`;

  /* Attach stable event listeners — no inline handlers */
  document.getElementById('oieAddBtn').addEventListener('click', oieAdd);
  /* Event delegation for qty/remove buttons in oieBody */
  document.getElementById('oieBody').addEventListener('click', oieBodyClick);
  document.getElementById('oieBody').addEventListener('change', oieBodyChange);
  document.getElementById('oieBody').addEventListener('input', oieBodyInput);

  renderOieBody();   // populate item rows

  document.getElementById('ordModActs').innerHTML = `
    <button class="btn b-out" onclick="closeOrdMov()">Cancel</button>
    <button class="btn b-blu b-sm" onclick="printOrd('${escJs(o.id)}')">🖨 Print</button>
    <button class="btn b-grn b-sm" onclick="waOrd('${escJs(o.id)}')">💬 WhatsApp</button>
    <button class="btn b-gold" style="flex:2" onclick="saveOrd()">💾 Save Changes</button>`;
}

/* Render item rows from editing.items — pure DOM build, no re-render of whole modal */
function renderOieBody(){
  const body = document.getElementById('oieBody'); if(!body) return;
  if(!editing.items.length){
    body.innerHTML='<div style="padding:12px;text-align:center;font-size:.78rem;color:var(--muted)">No items — add from list below</div>';
    return;
  }
  body.innerHTML = editing.items.map((it,i)=>`
    <div class="oie-r" data-idx="${i}">
      <div class="oie-name" title="${esc(it.name)}">${esc(it.name)}</div>
      <div class="oie-rate">${priceHtml(it.price,'rs-sm','num-sm')}</div>
      <div class="oie-qc">
        <button class="oie-qb" data-act="dec" data-idx="${i}">−</button>
        <input class="oie-qin" type="number" data-idx="${i}" value="${it.qty}" min="1" max="999"/>
        <button class="oie-qb" data-act="inc" data-idx="${i}">+</button>
      </div>
      <div class="oie-sub" id="oie-sub-${i}">${priceHtml(it.price*it.qty,'rs-sm','num-sm','gold-text')}</div>
      <button class="oie-del" data-act="del" data-idx="${i}" title="Remove">🗑</button>
    </div>`).join('');
  updateOieTot();
}

/* Event delegation handlers */
function oieBodyClick(e){
  const act = e.target.dataset.act;
  const idx = parseInt(e.target.dataset.idx);
  if(isNaN(idx)) return;
  if(act==='inc'){ editing.items[idx].qty = Math.min(999, editing.items[idx].qty+1); applyOieRow(idx); }
  if(act==='dec'){ editing.items[idx].qty = Math.max(1,   editing.items[idx].qty-1); applyOieRow(idx); }
  if(act==='del'){ editing.items.splice(idx,1); renderOieBody(); }
}
function oieBodyInput(e){
  if(!e.target.classList.contains('oie-qin')) return;
  const idx=parseInt(e.target.dataset.idx); if(isNaN(idx)) return;
  const v=Math.max(1,Math.min(999,parseInt(e.target.value)||1));
  editing.items[idx].qty=v;
  applyOieRow(idx);
}
function oieBodyChange(e){
  if(!e.target.classList.contains('oie-qin')) return;
  oieBodyInput(e);  // catch blur-triggered change too
}

/* Patch a single row's qty input and subtotal WITHOUT re-rendering whole list */
function applyOieRow(idx){
  const it=editing.items[idx];
  const inp=document.querySelector(`.oie-qin[data-idx="${idx}"]`);
  if(inp) inp.value=it.qty;
  const sub=document.getElementById('oie-sub-'+idx);
  if(sub) sub.innerHTML=priceHtml(it.price*it.qty,'rs-sm','num-sm','gold-text');
  updateOieTot();
}
function updateOieTot(){
  calcTotal();
  const el=document.getElementById('oieTot');
  if(el) el.innerHTML=priceHtml(editing.total,'rs-md','num-lg','gold-text');
}
function oieAdd(){
  const sel=document.getElementById('oieAddSel'); if(!sel) return;
  const pid=parseInt(sel.value);
  const prod=products.find(p=>p.id===pid); if(!prod){ toast('Product not found'); return; }
  const ex=editing.items.find(i=>i.id===pid);
  if(ex){ ex.qty+=1; }
  else{ editing.items.push({id:prod.id,name:prod.name,qty:1,price:prod.price,cat:prod.cat}); }
  renderOieBody();
  toast('Added: '+prod.name);
}

/* ★ FIX #4: Save reads from stable input IDs — never from potentially-stale onchange bindings */
function saveOrd(){
  if(!editing) return;
  editing.name    = document.getElementById('eN')?.value.trim()  || editing.name;
  editing.phone   = document.getElementById('ePh')?.value.trim() || editing.phone;
  editing.email   = document.getElementById('eEm')?.value.trim() || editing.email;
  editing.address = document.getElementById('eAd')?.value.trim() || editing.address;
  editing.payment = document.getElementById('ePy')?.value        || editing.payment;
  editing.status  = document.getElementById('eSt')?.value        || editing.status;
  editing.notes   = document.getElementById('eNo')?.value.trim();  // empty string is valid
  calcTotal();

  const idx=orders.findIndex(o=>o.id===editing.id);
  if(idx>=0) orders[idx]=editing;
  saveOrderList(); renderOrders(); renderDash(); closeOrdMov();
  toast('Order saved ✅');
}

/* ════════════════════════════════════════════════════════
   PRINT INVOICE (★ FIX #5: title set immediately before fonts load)
════════════════════════════════════════════════════════ */
function printOrd(id){
  const src = (editing && editing.id===id) ? editing : orders.find(x=>x.id===id);
  if(!src) return;
  const rows = src.items.map((i,n)=>`
    <tr><td>${n+1}</td><td>${esc(i.name)}</td><td>${i.cat||'-'}</td>
    <td style="text-align:center">${i.qty}</td>
    <td style="text-align:right">₹${i.price.toLocaleString('en-IN')}</td>
    <td style="text-align:right"><strong>₹${(i.price*i.qty).toLocaleString('en-IN')}</strong></td></tr>`).join('');

  /* ★ Title set before font CDN loads — no "KRS" flash */
  const TITLE = `Invoice ${src.id} \u2013 SS Enterprises`;
  const w = window.open('','_blank','width=900,height=680,noopener');
  if(!w){ toast('⚠️ Please allow popups to print'); return; }
  w.document.write(`<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/>
<title>${TITLE}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  body{font-family:'DM Sans',sans-serif;padding:30px;color:#0F0F0F}
  .hdr{display:flex;justify-content:space-between;border-bottom:2px solid #EEE;padding-bottom:15px;margin-bottom:25px}
  .brand{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:900;}
  .sub{color:#6B6256;font-size:0.85rem;margin-top:5px;line-height:1.4}
  .dt{width:100%;border-collapse:collapse;font-size:0.85rem;}
  .dt th{text-align:left;padding:10px;background:#F8F8F5;border-bottom:2px solid #DDD8CE;}
  .dt td{padding:10px;border-bottom:1px solid #EEE;}
  @media print { body{padding:0} }
</style>
</head>
<body onload="setTimeout(()=>{window.print();window.close();},500)">
  <div class="hdr">
    <div>
      <div class="brand">🎆 SS Enterprises</div>
      <div class="sub">3/224, C.N.Patti Road, Alamarathupatti(PO), Thirurhangal(VIA)<br/>Sivakasi -626130 &nbsp;|&nbsp; 📞 +91 9442554183</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:1.4rem;font-weight:700">INVOICE</div>
      <div class="sub">Order: <strong>${src.id}</strong><br/>Date: ${new Date(src.date).toLocaleString()}</div>
    </div>
  </div>
  <div style="margin-bottom:20px;font-size:0.9rem;line-height:1.5">
    <strong>Bill To:</strong><br/>
    ${esc(src.name)}<br/>
    ${esc(src.phone)}<br/>
    ${esc(src.email||'')}<br/>
    ${esc(src.city||'')}
  </div>
  <table class="dt">
    <thead><tr>
      <th style="width:50px">S.No</th><th>Product Name</th><th>Category</th>
      <th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="margin-top:20px;text-align:right;font-size:1.2rem">
    Grand Total: <strong>₹${src.total.toLocaleString('en-IN')}</strong>
  </div>
  <div style="margin-top:40px;text-align:center;color:#9C9080;font-size:0.8rem">
    Thank you for your business!
  </div>
</body></html>\`);
}

/* ════════════════════════════════════════════════════════
   PRODUCT ADMIN — Full inline editing, CSV import/export
════════════════════════════════════════════════════════ */
function renderProds(){
  const q   = (document.getElementById('psrch')?.value||'').toLowerCase();
  const cat = document.getElementById('pcat')?.value||'';
  const stk = document.getElementById('pstk')?.value||'';
  /* populate category dropdown */
  const cats=[...new Set(products.map(p=>p.cat))].sort();
  const catEl=document.getElementById('pcat');
  if(catEl){ const cur=catEl.value; catEl.innerHTML='<option value="">All Categories</option>'+cats.map(c=>`<option value="${esc(c)}"${c===cur?' selected':''}>${esc(c)}</option>`).join(''); }
  let f=products;
  if(q)  f=f.filter(p=>p.name.toLowerCase().includes(q)||p.cat.toLowerCase().includes(q));
  if(cat) f=f.filter(p=>p.cat===cat);
  if(stk==='in')  f=f.filter(p=>p.inStock!==false);
  if(stk==='out') f=f.filter(p=>p.inStock===false);
  const pcnt=document.getElementById('pcnt'); if(pcnt) pcnt.textContent=f.length+' of '+products.length+' products';
  if(!f.length){ document.getElementById('prodTbl').innerHTML=`<div class="empty-row">No products found</div>`; return; }
  document.getElementById('prodTbl').innerHTML=`
    <table class="dt">
      <thead><tr>
        <th style="width:36px"></th>
        <th>Product Name</th>
        <th>Category</th>
        <th>Price (₹) <span style="font-size:.58rem;opacity:.6;font-weight:400">— edit inline</span></th>
        <th>Per Unit</th>
        <th>Stock Status</th>
        <th style="text-align:center">Actions</th>
      </tr></thead>
      <tbody>${f.map(p=>`<tr id="pr-${p.id}" style="${p.inStock===false?'opacity:.6':''}">
        <td style="padding:4px 6px"><div class="p-img-w">
          <img src="${getProductImg(p)}" loading="lazy" data-cat="${encodeURIComponent(p.cat)}" data-img-step="0" onload="this.classList.add('v')" onerror="handleImgErr(this)"/>
          <span style="font-size:.85rem">${p.e||'🎆'}</span>
        </div></td>
        <td style="font-weight:600;font-size:.77rem">${esc(p.name)}</td>
        <td style="font-size:.72rem;color:var(--sub)">${esc(p.cat)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:4px">
            <span style="font-family:system-ui;font-weight:700;color:var(--sub);font-size:.8rem">₹</span>
            <input class="ie-inp" type="number" id="pr-price-${p.id}" value="${p.price}" min="1" step="1"
              onkeydown="if(event.key==='Enter')saveProdInline(${p.id})"/>
            <button class="ie-save" onclick="saveProdInline(${p.id})">✓</button>
          </div>
        </td>
        <td>
          <input class="ie-inp wide" type="text" id="pr-per-${p.id}" value="${esc(p.per)}"
            style="width:90px" onkeydown="if(event.key==='Enter')saveProdInline(${p.id})"/>
        </td>
        <td>
          <label class="tog" title="Toggle In/Out Stock">
            <input type="checkbox" ${p.inStock!==false?'checked':''} onchange="toggleStock(${p.id})"/>
            <span class="slider"></span>
          </label>
          <span class="is ${p.inStock===false?'oos':''}" style="margin-left:6px;vertical-align:middle">
            ${p.inStock===false?'Out':'In Stock'}
          </span>
        </td>
        <td><div class="acts" style="justify-content:center">
          <button class="ib" onclick="openEditProd(${p.id})" title="Full Edit">✏️</button>
          <button class="ib r" onclick="delProd(${p.id})" title="Delete">🗑</button>
        </div></td>
      </tr>`).join('')}</tbody>
    </table>`;
}

function saveProdInline(id){
  const p=products.find(x=>x.id===id); if(!p) return;
  const priceEl=document.getElementById('pr-price-'+id);
  const perEl=document.getElementById('pr-per-'+id);
  const newPrice=parseFloat(priceEl?.value);
  if(isNaN(newPrice)||newPrice<=0){ toast('⚠️ Invalid price'); if(priceEl) priceEl.value=p.price; return; }
  const oldPrice=p.price;
  p.price=newPrice;
  if(perEl && perEl.value.trim()) p.per=perEl.value.trim();
  saveProdList();
  renderStock();
  renderDash();
  if(oldPrice!==newPrice) toast(`✅ ${esc(p.name)}: ₹${oldPrice} → ₹${newPrice}`);
  else toast(`✅ ${esc(p.name)} updated`);
}

function toggleStock(id){
  const p=products.find(x=>x.id===id); if(!p) return;
  p.inStock=!p.inStock; saveProdList(); renderProds(); renderStock(); renderDash();
  toast(esc(p.name)+' '+(p.inStock?'✅ In Stock':'⚠️ Out of Stock'));
}
function bulkInStock(){
  if(!confirm('Mark ALL products as In Stock?')) return;
  products.forEach(p=>p.inStock=true); saveProdList(); renderProds(); renderStock(); renderDash();
  toast('All products In Stock ✅');
}
function delProd(id){
  const p=products.find(x=>x.id===id);
  if(!p||!confirm(`Delete "${p.name}"?`)) return;
  products=products.filter(x=>x.id!==id); saveProdList(); renderProds(); renderDash(); renderStock(); toast('Deleted');
}
function resetProds(){
  if(!confirm('Reset to full default 172-product list? All price changes and custom products will be lost.')) return;
  localStorage.removeItem('kc_products');
  products=DEFAULT_PRODUCTS.map(p=>({...p})); saveProdList(); renderProds(); renderDash(); renderStock();
  toast('Reset to 172 defaults ✅');
}

let editProdId=null;
function openAddProd(){
  editProdId=null;
  document.getElementById('prodModTitle').textContent='➕ Add Product';
  ['pEditId','pName','pImg'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('pCatSel').value='Electric Crackers';
  document.getElementById('pPrice').value='';
  document.getElementById('pPer').value='1 Box';
  document.getElementById('pEmoji').value='🎆';
  document.getElementById('pStock').checked=true;
  document.getElementById('prodMov').classList.add('show');
}
function openEditProd(id){
  const p=products.find(x=>x.id===id); if(!p) return;
  editProdId=id;
  document.getElementById('prodModTitle').textContent='✏️ Edit Product';
  document.getElementById('pEditId').value=id;
  document.getElementById('pName').value=p.name;
  document.getElementById('pCatSel').value=p.cat;
  document.getElementById('pPrice').value=p.price;
  document.getElementById('pPer').value=p.per||'1 Box';
  document.getElementById('pImg').value=p.img||'';
  document.getElementById('pEmoji').value=p.e||'🎆';
  document.getElementById('pStock').checked=p.inStock!==false;
  document.getElementById('prodMov').classList.add('show');
}
function closeProdMov(){ document.getElementById('prodMov').classList.remove('show'); }
document.getElementById('prodMov').addEventListener('click', e=>{ if(e.target===document.getElementById('prodMov')) closeProdMov(); });
function saveProd(){
  const name=document.getElementById('pName').value.trim();
  const cat=document.getElementById('pCatSel').value;
  const price=parseFloat(document.getElementById('pPrice').value);
  if(!name){ toast('⚠️ Name required'); return; }
  if(!price||price<=0){ toast('⚠️ Valid price required'); return; }
  const obj={name,cat,price,per:document.getElementById('pPer').value.trim()||'1 Box',
             img:document.getElementById('pImg').value.trim(),
             e:document.getElementById('pEmoji').value.trim()||'🎆',
             inStock:document.getElementById('pStock').checked};
  if(editProdId){
    const p=products.find(x=>x.id===editProdId);
    if(p){ Object.assign(p,obj); } toast('Updated ✅');
  } else {
    obj.id=Math.max(0,...products.map(p=>p.id||0))+1;
    obj.stockQty=0;
    products.push(obj); toast('Product added ✅');
  }
  saveProdList(); closeProdMov(); renderProds(); renderDash(); renderStock();
}

/* ── CSV Export (Products) ── */
function exportProdCSV(){
  const hdr=['id','name','category','price','per','emoji','inStock','stockQty'];
  const rows=products.map(p=>[
    p.id, `"${(p.name||'').replace(/"/g,'""')}"`, `"${(p.cat||'').replace(/"/g,'""')}"`,
    p.price, `"${(p.per||'').replace(/"/g,'""')}"`, p.e||'🎆',
    p.inStock===false?'false':'true', p.stockQty||0
  ]);
  const csv=[hdr,...rows].map(r=>r.join(',')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  a.download='products-'+new Date().toISOString().split('T')[0]+'.csv';
  a.click();
  toast('📥 Products exported as CSV');
}

function downloadCsvTemplate(){
  const tmpl=`name,category,price,per,emoji,inStock,stockQty\n6" Lakshmi,Electric Crackers,100,1 Pkt,🧨,true,50\nFlower Pots Big,Flower Pots,100,1 Box,🌸,true,30\n520 Shot,Shots,12000,1 Box,🎆,false,0`;
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([tmpl],{type:'text/csv;charset=utf-8;'}));
  a.download='products-template.csv';
  a.click();
}

/* ── CSV Import ── */
let _importRows=[];
function openImportMov(){
  _importRows=[];
  document.getElementById('импортRes').innerHTML='';
  document.getElementById('importConfirmBtn').style.display='none';
  const fi=document.getElementById('csvFileInput'); if(fi) fi.value='';
  document.getElementById('importMov').classList.add('show');
}
function closeImportMov(){ document.getElementById('importMov').classList.remove('show'); _importRows=[]; }
document.getElementById('importMov').addEventListener('click',e=>{ if(e.target===document.getElementById('importMov')) closeImportMov(); });

function handleCsvDrop(e){
  e.preventDefault();
  document.getElementById('importDropzone').classList.remove('drag-over');
  const file=e.dataTransfer?.files?.[0];
  if(!file){ return; }
  handleCsvFile(file);
}
function handleCsvFile(file){
  if(!file){ return; }
  if(!file.name.match(/\.csv$/i)){ showImpErr('⚠️ Only .csv files are supported. In Excel: File → Save As → CSV (UTF-8).'); return; }
  const reader=new FileReader();
  reader.onload=ev=>parseCsv(ev.target.result);
  reader.readAsText(file,'UTF-8');
}
function parseCsv(text){
  const lines=text.trim().split(/\r?\n/);
  if(lines.length<2){ showImpErr('⚠️ CSV must have a header row and at least one data row.'); return; }
  const headers=lines[0].split(',').map(h=>h.trim().toLowerCase().replace(/[^a-z]/g,''));
  const ni=headers.indexOf('name'), pi=headers.indexOf('price');
  const ci=headers.indexOf('category'), peri=headers.indexOf('per');
  const ei=headers.indexOf('emoji'), si=headers.indexOf('instock');
  const qi=headers.indexOf('stockqty');
  if(ni<0||pi<0){ showImpErr('⚠️ CSV must have "name" and "price" columns. Check: '+headers.join(', ')); return; }

  const parsed=[]; const errors=[];
  for(let i=1;i<lines.length;i++){
    if(!lines[i].trim()) continue;
    const cols=splitCsvRow(lines[i]);
    const name=(cols[ni]||'').trim();
    const price=parseFloat(cols[pi]);
    if(!name){ errors.push(`Row ${i+1}: missing name`); continue; }
    if(isNaN(price)||price<=0){ errors.push(`Row ${i+1}: invalid price for "${name}"`); continue; }
    parsed.push({
      name, price,
      cat:(ci>=0&&cols[ci])?cols[ci].trim():'General',
      per:(peri>=0&&cols[peri])?cols[peri].trim():'1 Box',
      e:(ei>=0&&cols[ei])?cols[ei].trim():'🎆',
      inStock:si<0||cols[si]?.trim().toLowerCase()!=='false',
      stockQty:qi>=0?Math.max(0,parseInt(cols[qi])||0):0,
    });
  }
  if(!parsed.length){ showImpErr('⚠️ No valid rows found.\n'+errors.join('\n')); return; }
  _importRows=parsed;

  /* Build preview */
  const rows=parsed.map(r=>{
    const existing=products.find(p=>p.name.toLowerCase()===r.name.toLowerCase());
    const cls=existing?'dup':'new';
    const badge=existing?`<span style="background:#FFF3CD;color:#856404;border-radius:4px;padding:1px 5px;font-size:.6rem;font-weight:700">UPDATE</span>`
                        :`<span style="background:#D1FAE5;color:#065F46;border-radius:4px;padding:1px 5px;font-size:.6rem;font-weight:700">NEW</span>`;
    return `<tr class="${cls}"><td>${badge}</td><td>${esc(r.name)}</td><td>${esc(r.cat)}</td><td>₹${r.price}</td><td>${esc(r.per)}</td><td>${r.inStock?'✅':'❌'}</td><td>${r.stockQty||0}</td></tr>`;
  }).join('');

  const errHtml=errors.length?`<div style="color:var(--red);font-size:.72rem;margin-top:7px">⚠️ Skipped ${errors.length} row(s): ${esc(errors.join('; '))}</div>`:'';
  document.getElementById('импортRes').innerHTML=`
    <div class="imp-res ok">✅ ${parsed.length} product(s) ready to import (${parsed.filter(r=>products.find(p=>p.name.toLowerCase()===r.name.toLowerCase())).length} updates, ${parsed.filter(r=>!products.find(p=>p.name.toLowerCase()===r.name.toLowerCase())).length} new)</div>
    ${errHtml}
    <div class="imp-preview">
      <table><thead><tr><th>Action</th><th>Name</th><th>Category</th><th>Price</th><th>Per</th><th>InStock</th><th>StockQty</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div>`;
  document.getElementById('importConfirmBtn').style.display='block';
}
function splitCsvRow(line){
  const result=[]; let cur=''; let inQ=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){ if(inQ&&line[i+1]==='"'){cur+='"';i++;}else inQ=!inQ; }
    else if(ch===','&&!inQ){ result.push(cur.trim()); cur=''; }
    else cur+=ch;
  }
  result.push(cur.trim());
  return result;
}
function showImpErr(msg){
  document.getElementById('импортRes').innerHTML=`<div class="imp-res err">${esc(msg)}</div>`;
  document.getElementById('importConfirmBtn').style.display='none';
  _importRows=[];
}
function confirmImport(){
  if(!_importRows.length){ toast('⚠️ No rows to import'); return; }
  let added=0, updated=0;
  const maxId=Math.max(0,...products.map(p=>p.id||0));
  let nextId=maxId+1;
  _importRows.forEach(r=>{
    const idx=products.findIndex(p=>p.name.toLowerCase()===r.name.toLowerCase());
    if(idx>=0){
      Object.assign(products[idx],{price:r.price,cat:r.cat,per:r.per,e:r.e,inStock:r.inStock,stockQty:r.stockQty});
      updated++;
    } else {
      products.push({id:nextId++,name:r.name,cat:r.cat,price:r.price,per:r.per,e:r.e,img:'',inStock:r.inStock,stockQty:r.stockQty});
      added++;
    }
  });
  saveProdList(); renderProds(); renderDash(); renderStock();
  closeImportMov();
  toast(`✅ Import done: ${added} added, ${updated} updated`);
}

/* ════════════════════════════════════════════════════════
   STOCK PAGE — with qty tracking, stats, search/filter
════════════════════════════════════════════════════════ */
function renderStock(){
  const el=document.getElementById('stockTbl'); if(!el) return;
  const q=(document.getElementById('sksrch')?.value||'').toLowerCase();
  const fcat=document.getElementById('skcat')?.value||'';
  const fflt=document.getElementById('skflt')?.value||'';

  /* populate category dropdown */
  const cats=[...new Set(products.map(p=>p.cat))].sort();
  const catEl=document.getElementById('skcat');
  if(catEl){ const cur=catEl.value; catEl.innerHTML='<option value="">All Categories</option>'+cats.map(c=>`<option value="${esc(c)}"${c===cur?' selected':''}>${esc(c)}</option>`).join(''); }

  /* stats */
  const total=products.length;
  const inSt=products.filter(p=>p.inStock!==false).length;
  const outSt=products.filter(p=>p.inStock===false).length;
  const low=products.filter(p=>p.inStock!==false&&(p.stockQty||0)>0&&(p.stockQty||0)<=5).length;
  const statsEl=document.getElementById('stockStats');
  if(statsEl) statsEl.innerHTML=`
    <div class="sc"><div class="sc-t"><span class="sc-l">Total Products</span><span class="sc-i">📦</span></div><div class="sc-v">${total}</div></div>
    <div class="sc"><div class="sc-t"><span class="sc-l">In Stock</span><span class="sc-i">✅</span></div><div class="sc-v grn">${inSt}</div></div>
    <div class="sc"><div class="sc-t"><span class="sc-l">Out of Stock</span><span class="sc-i">⚠️</span></div><div class="sc-v ${outSt>0?'rd':'grn'}">${outSt}</div></div>
    <div class="sc"><div class="sc-t"><span class="sc-l">Low Stock (≤5)</span><span class="sc-i">🔔</span></div><div class="sc-v ${low>0?'rd':'grn'}">${low}</div></div>`;

  /* filter products */
  let f=products;
  if(q)  f=f.filter(p=>p.name.toLowerCase().includes(q)||p.cat.toLowerCase().includes(q));
  if(fcat) f=f.filter(p=>p.cat===fcat);
  if(fflt==='out') f=f.filter(p=>p.inStock===false);
  if(fflt==='in')  f=f.filter(p=>p.inStock!==false);
  if(fflt==='low') f=f.filter(p=>p.inStock!==false&&(p.stockQty||0)>0&&(p.stockQty||0)<=5);

  if(!f.length){ el.innerHTML=`<div class="empty-row">No products match the current filter</div>`; return; }

  /* group by category */
  const groups={};
  f.forEach(p=>{if(!groups[p.cat])groups[p.cat]=[];groups[p.cat].push(p);});

  el.innerHTML=Object.entries(groups).map(([cat,items])=>`
    <div class="cat-block">
      <div class="cat-label">${esc(cat)} <span style="opacity:.4;font-size:.62rem">(${items.length})</span></div>
      <div class="tw"><table class="dt">
        <thead><tr>
          <th style="width:34px"></th>
          <th>Product</th>
          <th>Price (₹)</th>
          <th>Stock Qty <span style="font-size:.58rem;opacity:.55;font-weight:400">0=unlimited</span></th>
          <th>Status</th>
          <th>In Stock</th>
          <th>Actions</th>
        </tr></thead>
        <tbody>${items.map(p=>{
          const qty=p.stockQty||0;
          const qBadge=p.inStock===false
            ?`<span class="qty-badge qty-out">⛔ Out</span>`
            :qty===0?`<span class="qty-badge qty-ok">∞ Unlimited</span>`
            :qty<=5?`<span class="qty-badge qty-low">⚠️ Low: ${qty}</span>`
            :`<span class="qty-badge qty-ok">✅ ${qty} units</span>`;
          return `<tr style="${p.inStock===false?'opacity:.6':''}">
            <td style="padding:4px 5px"><div class="p-img-w">
              <img src="${getProductImg(p)}" loading="lazy" data-cat="${encodeURIComponent(p.cat)}" data-img-step="0" onload="this.classList.add('v')" onerror="handleImgErr(this)"/>
              <span>${p.e||'🎆'}</span>
            </div></td>
            <td style="font-weight:600;font-size:.77rem">${esc(p.name)}</td>
            <td>
              <div style="display:flex;align-items:center;gap:3px">
                <span style="font-family:system-ui;font-weight:700;color:var(--sub);font-size:.78rem">₹</span>
                <input class="ie-inp" type="number" id="sk-pr-${p.id}" value="${p.price}" min="1" step="1"
                  onkeydown="if(event.key==='Enter')saveStockInline(${p.id})"/>
                <button class="ie-save" onclick="saveStockInline(${p.id})">✓</button>
              </div>
            </td>
            <td>
              <div style="display:flex;align-items:center;gap:3px">
                <input class="ie-inp" type="number" id="sk-qty-${p.id}" value="${qty}" min="0" step="1"
                  placeholder="0=∞" title="0 = unlimited"
                  onkeydown="if(event.key==='Enter')saveStockInline(${p.id})"/>
                <button class="ie-save" onclick="saveStockInline(${p.id})">✓</button>
              </div>
            </td>
            <td>${qBadge}</td>
            <td><label class="tog"><input type="checkbox" ${p.inStock!==false?'checked':''} onchange="toggleStock(${p.id})"/><span class="slider"></span></label></td>
            <td><button class="ib" onclick="openEditProd(${p.id})" title="Full Edit">✏️</button></td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>`).join('');
}

function saveStockInline(id){
  const p=products.find(x=>x.id===id); if(!p) return;
  const priceEl=document.getElementById('sk-pr-'+id);
  const qtyEl=document.getElementById('sk-qty-'+id);
  const newPrice=parseFloat(priceEl?.value);
  const newQty=parseInt(qtyEl?.value)||0;
  if(isNaN(newPrice)||newPrice<=0){ toast('⚠️ Invalid price'); if(priceEl) priceEl.value=p.price; return; }
  const oldP=p.price;
  p.price=newPrice;
  p.stockQty=Math.max(0,newQty);
  /* auto out-of-stock if qty was tracked and reaches 0 */
  saveProdList();
  renderDash();
  renderProds();
  if(oldP!==newPrice) toast(`✅ ${esc(p.name)}: ₹${oldP}→₹${newPrice}, Qty:${newQty===0?'∞':newQty}`);
  else toast(`✅ ${esc(p.name)} stock qty: ${newQty===0?'Unlimited':newQty}`);
  /* re-render stock to show updated badge */
  renderStock();
}

function bulkSetQty(){
  const val=prompt('Set stock quantity for ALL products (0 = unlimited):','0');
  if(val===null) return;
  const qty=Math.max(0,parseInt(val)||0);
  products.forEach(p=>p.stockQty=qty);
  saveProdList(); renderStock(); renderDash();
  toast(`✅ All products set to ${qty===0?'unlimited':qty+' units'}`);
}




/* ════════════════════════════════════════════════════════
   SETTINGS (★ FIX #6: min order configurable, syncs to shop)
════════════════════════════════════════════════════════ */
function getSettings(){ try{return JSON.parse(localStorage.getItem('kc_settings')||'{}')}catch(e){return {}} }
function renderSettingsDisplay(){
  const s=getSettings();
  const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.value=v; };
  set('sMinOrder', s.minOrder||3000);
  set('sShopName', s.shopName||'SS Enterprises');
  set('sPhone',    s.shopPhone||'919842160150');
  set('sEmail',    s.shopEmail||'karthecrackers@gmail.com');
  const disp=document.getElementById('sdisplay');
  if(disp) disp.innerHTML=
    '<div>Min Order: <b>₹'+(s.minOrder||3000).toLocaleString('en-IN')+'</b></div>'+
    '<div>Shop: <b>'+esc(s.shopName||'SS Enterprises')+'</b></div>'+
    '<div>WhatsApp: <b>'+esc(s.shopPhone||'919842160150')+'</b></div>'+
    '<div>Email: <b>'+esc(s.shopEmail||'karthecrackers@gmail.com')+'</b></div>'+
    '<div>Admin user: <b>'+(esc(ADMIN_U)||'(not set)')+'</b> &nbsp;|&nbsp; Password: <b>••••••••</b></div>'+
    '<div style="font-size:.64rem;color:var(--muted);margin-top:4px">Password saved in browser only. Use Settings to change it anytime.</div>';
}
function saveSettings(){
  const minOrder=parseInt(document.getElementById('sMinOrder').value)||3000;
  if(minOrder<0){ toast('⚠️ Cannot be negative'); return; }
  const s={
    minOrder,
    shopName:  document.getElementById('sShopName').value.trim()||'SS Enterprises',
    shopPhone: document.getElementById('sPhone').value.trim().replace(/\D/g,'')||'919842160150',
    shopEmail: document.getElementById('sEmail').value.trim()||'karthecrackers@gmail.com',
  };
  localStorage.setItem('kc_settings', JSON.stringify(s));
  renderSettingsDisplay();
  toast(`Settings saved ✅ — Min order: ₹${minOrder.toLocaleString('en-IN')}`);
}
function savePass(){
  const u=document.getElementById('sUser').value.trim();
  const p=document.getElementById('sPass').value;
  const pc=document.getElementById('sPassC').value;
  if(!u||u.length<3){toast('⚠️ Username min 3 characters');return;}
  if(!p||p.length<8){toast('⚠️ Password min 8 characters');return;}
  if(p!==pc){toast('⚠️ Passwords do not match');return;}
  ADMIN_U=u;ADMIN_P=p;
  localStorage.setItem('kc_admin_u',u);localStorage.setItem('kc_admin_p',p);
  toast('✅ Password updated — please log in again next session');
  renderSettingsDisplay();
}

/* ════════════════════════════════════════════════════════
   REPORTS
════════════════════════════════════════════════════════ */
function renderReports(){
  const el=document.getElementById('reportContent'); if(!el) return;
  const rev=orders.filter(o=>o.status!=='Cancelled').reduce((a,o)=>a+o.total,0);
  const avg=orders.length?Math.round(rev/orders.length):0;
  const pm={};
  orders.forEach(o=>o.items.forEach(i=>{
    if(!pm[i.name]) pm[i.name]={name:i.name,qty:0,rev:0};
    pm[i.name].qty+=i.qty; pm[i.name].rev+=i.price*i.qty;
  }));
  const top=Object.values(pm).sort((a,b)=>b.rev-a.rev).slice(0,10);
  const mm={};
  orders.forEach(o=>{
    const m=new Date(o.date).toLocaleDateString('en-IN',{month:'short',year:'numeric'});
    if(!mm[m]) mm[m]={m,n:0,r:0}; mm[m].n++; mm[m].r+=o.total;
  });
  const delRate=orders.length?Math.round(orders.filter(o=>o.status==='Delivered').length/orders.length*100):0;
  el.innerHTML=`
    <div class="sg" style="margin-bottom:13px">
      <div class="sc hi"><div class="sc-t"><span class="sc-l">Revenue</span><span class="sc-i">💰</span></div>
        <div class="sc-v gld">${priceHtml(rev,'rs-lg','num-xl','gld')}</div></div>
      <div class="sc"><div class="sc-t"><span class="sc-l">Orders</span><span class="sc-i">📦</span></div><div class="sc-v">${orders.length}</div></div>
      <div class="sc"><div class="sc-t"><span class="sc-l">Avg Order</span><span class="sc-i">📊</span></div>
        <div class="sc-v">${priceHtml(avg,'rs-md','num-lg')}</div></div>
      <div class="sc"><div class="sc-t"><span class="sc-l">Delivery Rate</span><span class="sc-i">✅</span></div>
        <div class="sc-v grn">${delRate}%</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div>
        <div style="font-size:.7rem;font-weight:700;color:var(--sub);margin-bottom:7px;text-transform:uppercase;letter-spacing:1px">🏆 Top Products by Revenue</div>
        <div class="tw"><table class="dt"><thead><tr><th>#</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
          <tbody>${top.map((p,i)=>`<tr>
            <td style="font-weight:700;color:var(--gold)">${i+1}</td>
            <td style="font-weight:500;font-size:.77rem">${esc(p.name)}</td>
            <td>${p.qty}</td>
            <td>${priceHtml(p.rev,'rs-sm','num-md')}</td>
          </tr>`).join('')}</tbody></table></div>
      </div>
      <div>
        <div style="font-size:.7rem;font-weight:700;color:var(--sub);margin-bottom:7px;text-transform:uppercase;letter-spacing:1px">📅 Monthly Summary</div>
        <div class="tw"><table class="dt"><thead><tr><th>Month</th><th>Orders</th><th>Revenue</th></tr></thead>
          <tbody>${Object.values(mm).map(m=>`<tr>
            <td>${esc(m.m)}</td><td>${m.n}</td><td>${priceHtml(m.r,'rs-sm','num-md')}</td>
          </tr>`).join('')}</tbody></table></div>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════
   EXPORT CSV
════════════════════════════════════════════════════════ */
function exportCSV(){
  const hdr=['Order ID','Name','Email','Phone','Address','Items','Total','Payment','Status','Date'];
  const rows=orders.map(o=>[
    o.id, `"${o.name}"`, `"${o.email}"`, o.phone, `"${o.address}"`,
    `"${o.items.map(i=>i.name+' x'+i.qty).join(', ')}"`,
    o.total, o.payment, o.status, fmtDate(o.date)
  ]);
  const csv=[hdr,...rows].map(r=>r.join(',')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  a.download='karthe-orders-'+new Date().toISOString().split('T')[0]+'.csv';
  a.click();
}

/* ════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════ */
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)';
  clearTimeout(t._t);
  t._t=setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(12px)'; },2800);
}

/* ════════════════════════════════════════════════════════
   ★ TAX INVOICE ENGINE — Simplified Rules
   
   Invoice Amount Rules (no complex GST calculation):
   ┌──────────────────┬──────────────────────────────┐
   │ Order Total      │ Tax Invoice Stated Amount     │
   ├──────────────────┼──────────────────────────────┤
   │ Below ₹5,000     │ ₹500 flat                    │
   │ ₹5,000 – ₹9,999  │ ₹500 – ₹1,000 (proportional)│
   │ ₹10,000 and above│ ₹1,000 (capped)              │
   └──────────────────┴──────────────────────────────┘
   
   - One invoice per order (no splitting)
   - Sequential numbers: KC-YYYY-NNNN
   - Stored in localStorage: kc_tax_invoices
   - Statuses: New → Issued
════════════════════════════════════════════════════════ */

const HSN_CODE = '36041000'; // Fireworks HSN code

/* ── Calculate invoice stated amount from order total ── */
function calcInvoiceAmount(orderTotal){
  if(orderTotal < 5000)  return 500;
  if(orderTotal >= 10000) return 1000;
  // ₹5000–₹9999: linear scale ₹500→₹1000
  return Math.round(500 + ((orderTotal - 5000) / 5000) * 500);
}

function getTaxInvoices(){
  try{ return JSON.parse(localStorage.getItem('kc_tax_invoices')||'[]'); }catch(e){ return []; }
}
function saveTaxInvoices(arr){
  localStorage.setItem('kc_tax_invoices', JSON.stringify(arr));
}

/* Generate sequential invoice number KC-YYYY-NNNN */
function nextInvNumber(){
  const invs = getTaxInvoices();
  const year = new Date().getFullYear();
  const same = invs.filter(i=>i.invNo && i.invNo.startsWith('KC-'+year+'-'));
  const last = same.length ? Math.max(...same.map(i=>parseInt((i.invNo.split('-')[2]||'0').replace(/\/S.*/,''))||0)) : 0;
  return 'KC-'+year+'-'+String(last+1).padStart(4,'0');
}

/* Auto-generate ONE invoice per order (called on every order save) */
function generateTaxInvoicesForOrder(order){
  const existing = getTaxInvoices();
  if(existing.some(i=>i.orderId===order.id)) return; // already done

  const invAmt = calcInvoiceAmount(order.total);

  const inv = {
    invNo:      nextInvNumber(),
    orderId:    order.id,
    customer:   order.name,
    phone:      order.phone,
    email:      order.email,
    address:    order.address,
    payment:    order.payment,
    notes:      order.notes||'',
    date:       order.date,
    items:      order.items,
    orderTotal: order.total,
    invAmount:  invAmt,        // stated invoice amount
    status:     'New',
    generated:  new Date().toISOString(),
  };

  saveTaxInvoices([inv, ...existing]);
}

/* Sync — ensure all orders have invoices, update display */
function syncTaxInvoices(){
  orders.forEach(o=>generateTaxInvoicesForOrder(o));
  const el=document.getElementById('taxMaxDisplay');
  if(el) el.textContent='₹500 – ₹1,000';
}

/* ── Render Tax Invoice list ── */
function renderTaxInv(){
  const invs = getTaxInvoices();
  const q  = (document.getElementById('tinvsrch')?.value||'').toLowerCase();
  const st = document.getElementById('tinvstat')?.value||'';
  let f = invs;
  if(q)  f = f.filter(i=>i.invNo.toLowerCase().includes(q)||i.orderId.toLowerCase().includes(q)||(i.customer||'').toLowerCase().includes(q));
  if(st) f = f.filter(i=>i.status===st);
  f.sort((a,b)=>new Date(b.generated)-new Date(a.generated));
  const el=document.getElementById('tinvcnt'); if(el) el.textContent=f.length+' invoices';

  if(!f.length){
    document.getElementById('taxInvTbl').innerHTML='<div class="empty-row">No tax invoices yet.<br/>They auto-generate when orders arrive.</div>';
    return;
  }

  document.getElementById('taxInvTbl').innerHTML=`
    <table class="dt">
      <thead><tr>
        <th>Invoice No.</th>
        <th>Order ID</th>
        <th>Customer</th>
        <th>Order Total</th>
        <th>Invoice Amount</th>
        <th>Date</th>
        <th>Status</th>
        <th>Actions</th>
      </tr></thead>
      <tbody>${f.map(inv=>`<tr>
        <td class="inv-no">${esc(inv.invNo)}</td>
        <td><span style="font-family:monospace;font-size:.68rem;color:var(--blue)">${esc(inv.orderId)}</span></td>
        <td>
          <div style="font-weight:600;font-size:.75rem">${esc(inv.customer)}</div>
          <div style="font-size:.64rem;color:var(--muted)">${esc(inv.phone)}</div>
        </td>
        <td>${priceHtml(inv.orderTotal,'rs-sm','num-md')}</td>
        <td><b style="color:var(--green)">${priceHtml(inv.invAmount,'rs-sm','num-md')}</b></td>
        <td style="font-size:.67rem;color:var(--muted)">${fmtDate(inv.date)}</td>
        <td><span class="tinv-badge ${inv.status==='Issued'?'tinv-issued':'tinv-new'}">${inv.status==='Issued'?'✅ Issued':'🆕 New'}</span></td>
        <td><div class="acts">
          <button class="ib" onclick="printTaxInv('${escJs(inv.invNo)}')" title="Print Invoice">🖨</button>
          <button class="ib g" onclick="markInvIssued('${escJs(inv.invNo)}')" title="Mark Issued"
            ${inv.status==='Issued'?'disabled style="opacity:.35;cursor:default"':''}>✅</button>
          <button class="ib r" onclick="delTaxInv('${escJs(inv.invNo)}')" title="Delete">🗑</button>
        </div></td>
      </tr>`).join('')}</tbody>
    </table>`;
}

function markInvIssued(invNo){
  const invs=getTaxInvoices();
  const inv=invs.find(i=>i.invNo===invNo);
  if(inv){inv.status='Issued';saveTaxInvoices(invs);renderTaxInv();toast('Marked as Issued ✅');}
}
function delTaxInv(invNo){
  if(!confirm('Delete invoice '+invNo+'?')) return;
  saveTaxInvoices(getTaxInvoices().filter(i=>i.invNo!==invNo));
  renderTaxInv(); toast('Invoice deleted');
}

/* ── Print a single GST-compliant A4 tax invoice ── */
function printTaxInv(invNo){
  const inv = getTaxInvoices().find(i=>i.invNo===invNo);
  if(!inv){ toast('Invoice not found'); return; }

  // Build item rows — show actual items but declared invoice value is inv.invAmount
  const rows = inv.items.map((item,n)=>`<tr>
    <td>${n+1}</td>
    <td>${esc(item.name)}</td>
    <td>${HSN_CODE}</td>
    <td style="text-align:center">${item.qty}</td>
    <td style="text-align:right">₹${item.price.toLocaleString('en-IN')}</td>
    <td style="text-align:right">₹${(item.price*item.qty).toLocaleString('en-IN')}</td>
  </tr>`).join('');

  const TITLE = 'Tax Invoice '+esc(inv.invNo)+' – SS Enterprises';
  const w = window.open('','_blank','width=960,height=720,noopener');
  if(!w){ toast('⚠️ Allow popups to print'); return; }

  w.document.write('<!DOCTYPE html><html lang="en"><head>\n'+
'<meta charset="UTF-8"/><title>'+TITLE+'</title>\n'+
'<style>\n'+
'*{box-sizing:border-box;margin:0;padding:0}\n'+
'body{font-family:Arial,sans-serif;padding:18px;color:#111;font-size:11px;max-width:800px;margin:0 auto}\n'+
'.top{display:flex;justify-content:space-between;border-bottom:3px double #000;padding-bottom:10px;margin-bottom:10px}\n'+
'.brand h1{font-size:17px;font-weight:900;margin-bottom:3px}\n'+
'.brand p{font-size:9.5px;color:#444;line-height:1.65}\n'+
'.inv-head{text-align:right}\n'+
'.inv-head h2{font-size:13px;font-weight:900;letter-spacing:3px;border:2px solid #111;padding:3px 10px;display:inline-block;margin-bottom:5px}\n'+
'.inv-head p{font-size:9.5px;color:#333;line-height:1.65}\n'+
'.inv-no-lbl{font-size:12px;font-weight:700;color:#1A4ED8}\n'+
'.party{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}\n'+
'.box{border:1px solid #CCC;border-radius:4px;padding:8px}\n'+
'.box h4{font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#666;margin-bottom:5px;border-bottom:1px solid #EEE;padding-bottom:3px}\n'+
'.box p{font-size:10px;line-height:1.65}\n'+
'table{width:100%;border-collapse:collapse;margin-bottom:10px}\n'+
'thead tr{background:#111;color:#fff}\n'+
'th{padding:5px 7px;text-align:left;font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}\n'+
'td{padding:4px 7px;border-bottom:1px solid #E8E8E8;font-size:10px}\n'+
'tbody tr:nth-child(even){background:#F9F9F9}\n'+
'.inv-val-box{border:2px solid #111;border-radius:6px;padding:14px 16px;text-align:center;margin:10px 0;background:#F8F5EC}\n'+
'.inv-val-lbl{font-size:10px;color:#555;margin-bottom:4px;font-weight:600;text-transform:uppercase;letter-spacing:1px}\n'+
'.inv-val-amt{font-size:28px;font-weight:900;color:#111;letter-spacing:-1px}\n'+
'.inv-val-words{font-size:10px;color:#444;margin-top:4px;font-style:italic}\n'+
'.note-box{background:#FFF8EC;border:1px solid #F0A500;border-radius:4px;padding:8px 10px;font-size:9px;color:#7A4200;margin-bottom:10px}\n'+
'.sig{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px;padding-top:10px;border-top:1px solid #DDD}\n'+
'.sig-box{font-size:9px;color:#555}\n'+
'.sig-line{border-top:1px solid #999;margin-top:28px;padding-top:4px;font-size:8.5px}\n'+
'.foot{text-align:center;font-size:9px;color:#777;border-top:1px solid #DDD;padding-top:8px;margin-top:8px}\n'+
'@media print{@page{size:A4;margin:10mm}body{padding:0}}\n'+
'</style></head><body>\n'+
'<div class="top">\n'+
'  <div class="brand">\n'+
'    <h1>🎆 SS Enterprises</h1>\n'+
'    <p>71-C, Gandhi Road, Opp. Ramji Poly Pack, Sivakasi – 626 123, Tamil Nadu<br/>'+
'    Ph: +91 98421 60150 / 60151 &nbsp;·&nbsp; karthecrackers@gmail.com<br/>'+
'    <strong>GSTIN: 33XXXXXXXXXXXXXXX</strong></p>\n'+
'  </div>\n'+
'  <div class="inv-head">\n'+
'    <h2>TAX INVOICE</h2>\n'+
'    <p class="inv-no-lbl">'+esc(inv.invNo)+'</p>\n'+
'    <p>Date: <strong>'+fmtDate(inv.date)+'</strong><br/>'+
'    Order: <strong>'+esc(inv.orderId)+'</strong><br/>'+
'    Payment: <strong>'+esc(inv.payment)+'</strong></p>\n'+
'  </div>\n'+
'</div>\n'+
'<div class="party">\n'+
'  <div class="box"><h4>Bill To</h4>\n'+
'    <p><strong>'+esc(inv.customer)+'</strong><br/>'+esc(inv.phone)+'<br/>'+esc(inv.email)+'<br/>'+esc(inv.address)+'</p></div>\n'+
'  <div class="box"><h4>Supply Info</h4>\n'+
'    <p>HSN Code: <strong>'+HSN_CODE+'</strong><br/>'+
'    Supply Type: B2C<br/>'+
'    Place of Supply: Tamil Nadu<br/>'+
'    Tax Treatment: Included in price</p></div>\n'+
'</div>\n'+
'<table>\n'+
'  <thead><tr><th>#</th><th>Product</th><th>HSN</th><th style="text-align:center">Qty</th>'+
'  <th style="text-align:right">Unit Price</th><th style="text-align:right">Amount</th></tr></thead>\n'+
'  <tbody>'+rows+'</tbody>\n'+
'</table>\n'+
'<div class="note-box">\n'+
'  <strong>ℹ️ Declaration:</strong> The declared invoice value is ₹'+inv.invAmount.toLocaleString('en-IN')+
'  as per applicable tax rules for fireworks/crackers retail transactions.'+
'  Actual order value: ₹'+inv.orderTotal.toLocaleString('en-IN')+'.'+
'  All taxes included in price.\n'+
'</div>\n'+
'<div class="inv-val-box">\n'+
'  <div class="inv-val-lbl">Invoice Declared Value (Tax Invoice Amount)</div>\n'+
'  <div class="inv-val-amt">₹'+inv.invAmount.toLocaleString('en-IN')+'</div>\n'+
'  <div class="inv-val-words">'+amountToWords(inv.invAmount)+' Rupees Only</div>\n'+
'</div>\n'+
'<div class="sig">\n'+
'  <div class="sig-box"><p>Received goods in good condition</p><div class="sig-line">Customer Signature &amp; Date</div></div>\n'+
'  <div class="sig-box" style="text-align:right"><p>For <strong>SS Enterprises</strong>, Sivakasi</p><div class="sig-line">Authorised Signatory</div></div>\n'+
'</div>\n'+
'<div class="foot">Thank you for your business! · SS Enterprises · +91 98421 60150 · karthecrackers@gmail.com · Subject to Sivakasi Jurisdiction</div>\n'+
'<script>document.fonts?document.fonts.ready.then(()=>setTimeout(()=>window.print(),300)):setTimeout(()=>window.print(),800);<\/script>\n'+
'</body></html>');
  w.document.close();

  // Auto-mark as Issued
  const invs=getTaxInvoices();
  const found=invs.find(i=>i.invNo===invNo);
  if(found&&found.status==='New'){found.status='Issued';saveTaxInvoices(invs);setTimeout(()=>renderTaxInv(),500);}
}

/* Print ALL new invoices */
function printAllTaxInv(){
  const newInvs=getTaxInvoices().filter(i=>i.status==='New');
  if(!newInvs.length){toast('No new invoices to print');return;}
  if(!confirm('Print '+newInvs.length+' new invoice(s)?')) return;
  newInvs.forEach((inv,i)=>setTimeout(()=>printTaxInv(inv.invNo), i*700));
}


function amountToWords(n){
  const ones=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
    'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function toWords(num){
    if(num===0) return '';
    if(num<20) return ones[num]+' ';
    if(num<100) return tens[Math.floor(num/10)]+' '+(num%10?ones[num%10]+' ':'');
    if(num<1000) return ones[Math.floor(num/100)]+' Hundred '+(num%100?toWords(num%100):'');
    if(num<100000) return toWords(Math.floor(num/1000))+'Thousand '+(num%1000?toWords(num%1000):'');
    if(num<10000000) return toWords(Math.floor(num/100000))+'Lakh '+(num%100000?toWords(num%100000):'');
    return toWords(Math.floor(num/10000000))+'Crore '+(num%10000000?toWords(num%10000000):'');
  }
  const r=Math.round(n);
  const paise=Math.round((n-r)*100);
  return (toWords(r)||'Zero ').trim()+(paise?' and '+toWords(paise).trim()+' Paise':'');
}

(function initAdmin(){
  ADMIN_U = localStorage.getItem('kc_admin_u') || '';
  ADMIN_P = localStorage.getItem('kc_admin_p') || '';
  if(!ADMIN_U || !ADMIN_P){
    const sub = document.getElementById('loginSubMsg');
    if(sub) sub.textContent = 'First visit — create your admin password below.';
    showSetup();
  }
})();

document.addEventListener('contextmenu',function(e){e.preventDefault();},{capture:true});

/* ════════════════════════════════════════════════════════
   FIREWORKS — Canvas particle engine (ambient, subtle)
════════════════════════════════════════════════════════ */
(function initFireworks(){
  const cv=document.getElementById('fwCanvas');
  if(!cv) return;
  const ctx=cv.getContext('2d');
  let W,H,particles=[];
  const resize=()=>{ W=cv.width=window.innerWidth; H=cv.height=window.innerHeight; };
  resize(); window.addEventListener('resize',resize);

  const COLORS=['#F0A500','#E85D04','#C97A0A','#FFD700','#FF6B35','#FFF0AA','#FF9500','#FF4E00'];
  class Particle{
    constructor(x,y,color){
      this.x=x; this.y=y; this.color=color;
      const ang=Math.random()*Math.PI*2;
      const spd=1.2+Math.random()*3.5;
      this.vx=Math.cos(ang)*spd; this.vy=Math.sin(ang)*spd;
      this.alpha=1; this.r=1.2+Math.random()*1.8;
      this.drag=.96+Math.random()*.02;
      this.gravity=.04+Math.random()*.03;
      this.life=0.8+Math.random()*.4;
    }
    update(){
      this.vx*=this.drag; this.vy*=this.drag;
      this.vy+=this.gravity;
      this.x+=this.vx; this.y+=this.vy;
      this.alpha-=.012;
    }
    draw(){
      ctx.save();
      ctx.globalAlpha=Math.max(0,this.alpha);
      ctx.fillStyle=this.color;
      ctx.shadowColor=this.color;
      ctx.shadowBlur=4;
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  function burst(x,y){
    const c=COLORS[Math.floor(Math.random()*COLORS.length)];
    const n=22+Math.floor(Math.random()*18);
    for(let i=0;i<n;i++) particles.push(new Particle(x,y,c));
  }

  function loop(){
    requestAnimationFrame(loop);
    ctx.clearRect(0,0,W,H);
    particles=particles.filter(p=>p.alpha>0);
    particles.forEach(p=>{ p.update(); p.draw(); });
  }
  loop();

  /* Random bursts at idle moments — subtle, not distracting */
  let lastBurst=0;
  function schedBurst(){
    const now=Date.now();
    if(now-lastBurst>3500){
      const x=W*(.15+Math.random()*.7);
      const y=H*(.1+Math.random()*.55);
      burst(x,y);
      lastBurst=now;
    }
    setTimeout(schedBurst, 2000+Math.random()*3000);
  }
  schedBurst();
})();

