import dns from "dns";

async function checkRegion() {
  const regions = [
    "ap-south-1", "ap-southeast-1", "ap-northeast-1", "ap-northeast-2", "ap-northeast-3",
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1",
    "sa-east-1", "ca-central-1", "me-central-1", "af-south-1"
  ];
  
  const ref = "mepowrsrbjddaqfvzvtc";
  
  // Resolve regional poolers to see which one works or resolves
  for (const r of regions) {
    const host = `aws-0-${r}.pooler.supabase.com`;
    dns.resolve(host, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        console.log(`Region ${r} resolves to:`, addresses);
      }
    });
  }
}

checkRegion().catch(console.error);
