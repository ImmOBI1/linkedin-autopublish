// LinkedIn Auto-Publisher
// Posts text + image to a LinkedIn company page.
// Usage: node publish.js --text "..." --image ./img.png
// Env: LINKEDIN_ACCESS_TOKEN, LINKEDIN_ORG_ID

const fs = require('fs');

function arg(name) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : null;
}

const text = arg('text') || process.env.POST_TEXT;
const imagePath = arg('image') || process.env.POST_IMAGE;
const token = process.env.LINKEDIN_ACCESS_TOKEN;
const orgId = process.env.LINKEDIN_ORG_ID || '140754014';

if (!token) { console.error('Missing LINKEDIN_ACCESS_TOKEN'); process.exit(1); }
if (!text) { console.error('Missing post text (--text or POST_TEXT)'); process.exit(1); }

const API = 'https://api.linkedin.com/v2';

async function registerUpload() {
  const r = await fetch(`${API}/assets?action=registerUpload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: `urn:li:organization:${orgId}`,
        serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }]
      }
    })
  });
  const j = await r.json();
  if (!r.ok) throw new Error('registerUpload: ' + JSON.stringify(j));
  return j.value;
}

async function uploadImage(uploadUrl, filePath) {
  const buf = fs.readFileSync(filePath);
  const r = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/octet-stream' },
    body: buf
  });
  if (!r.ok) throw new Error('upload failed: ' + r.status + ' ' + (await r.text()));
}

async function createPost(assetUrn) {
  const body = {
    author: `urn:li:organization:${orgId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: assetUrn ? 'IMAGE' : 'NONE',
        media: assetUrn ? [{ status: 'READY', media: assetUrn }] : []
      }
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
  };
  const r = await fetch(`${API}/ugcPosts`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  if (!r.ok) throw new Error('createPost: ' + JSON.stringify(j));
  return j;
}

(async () => {
  let assetUrn = null;
  if (imagePath && fs.existsSync(imagePath)) {
    const reg = await registerUpload();
    await uploadImage(reg.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl, imagePath);
    assetUrn = reg.asset;
    console.log('Image uploaded:', assetUrn);
  }
  const post = await createPost(assetUrn);
  console.log('Posted:', JSON.stringify(post));
})();