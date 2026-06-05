// contractor-v003-1-afo-lite — CCS Services Group simplified functional demo
// Isolated from contractor-v003-1-afo and all v003/v004-v008 demos.

const VERSION = 'lite-0.1.0';
const COMPANY = 'CCS Services Group';
const PHONE = '(818) 624-7212';
const PHONE_URL = 'tel:+18186247212';
const UPLOAD_PREFIX = 'contractor-v003-1-lite/uploads/';
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
const CHAT_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const ADMIN_PASSWORD = 'demo';

const KNOWLEDGE = [
  { id:'kitchen', title:'Kitchen Remodeling', category:'kitchens', area:'Los Angeles', body:'CCS Services Group remodels kitchens throughout