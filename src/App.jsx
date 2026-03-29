import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg: "#0F0704", dark: "#1A0D07", surface: "#271409",
  surfaceHigh: "#3A1E0E", border: "rgba(196,128,60,0.18)",
  borderBright: "rgba(196,128,60,0.45)",
  caramel: "#C4803C", gold: "#D4A84B", amber: "#E8B87A",
  cream: "#F5E4CC", lightCream: "#FBF3E6",
  muted: "#8C6B52", mutedLight: "#B08868",
  textPrimary: "#F5E4CC", textSecondary: "#B08868",
  success: "#52B380", warning: "#E8B04A", error: "#E05C5C",
  new: "#4A9EE8", making: "#E8B04A", ready: "#52B380",
};
const display = "'Cormorant Garamond', Georgia, serif";
const body = "'Outfit', sans-serif";
const s = (obj) => Object.entries(obj).map(([k,v]) => `${k}:${v}`).join(";");

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const MENU = {
  espresso: [
    { id:1, name:"Single Origin Espresso", price:4.50, desc:"Ethiopia Yirgacheffe · washed", cal:5, tag:"Popular" },
    { id:2, name:"Cortado", price:5.00, desc:"2oz ristretto · 2oz steamed milk", cal:45 },
    { id:3, name:"Flat White", price:5.50, desc:"Ristretto shots · silky microfoam", cal:120, tag:"Best Seller" },
    { id:4, name:"Cappuccino", price:5.50, desc:"Classic Italian ratio · dry foam", cal:90 },
    { id:5, name:"Oat Milk Latte", price:6.00, desc:"Double shot · 8oz steamed oat", cal:180 },
  ],
  pourover: [
    { id:6, name:"V60 Pour Over", price:7.00, desc:"Rotating origin · 12oz · 4 min brew", cal:5, tag:"Chef's Pick" },
    { id:7, name:"Chemex Batch", price:8.00, desc:"24oz · clean & bright profile", cal:5 },
    { id:8, name:"Aeropress", price:6.50, desc:"Immersion · full bodied · 2 min", cal:5 },
  ],
  coldbrew: [
    { id:9, name:"Classic Cold Brew", price:6.00, desc:"18hr steep · 12oz over ice", cal:10, tag:"Popular" },
    { id:10, name:"Nitro Cold Brew", price:7.00, desc:"Nitrogen-infused · cascading pour", cal:10 },
    { id:11, name:"Cold Brew Tonic", price:7.50, desc:"Cold brew · fever-tree · citrus peel", cal:80 },
  ],
  pastries: [
    { id:13, name:"Kouign-Amann", price:5.50, desc:"Laminated · caramelized Breton sugar", cal:420, tag:"Popular" },
    { id:14, name:"Almond Croissant", price:5.00, desc:"Twice-baked · frangipane filling", cal:380 },
    { id:15, name:"Cardamom Knot", price:4.00, desc:"Scandinavian style · pearl sugar", cal:290 },
    { id:16, name:"Seasonal Tart", price:6.00, desc:"Ask barista · changes daily", cal:310 },
  ],
};

const REVENUE_DATA = [
  { month:"Jan",actual:142,proj:135 },{ month:"Feb",actual:158,proj:150 },
  { month:"Mar",actual:167,proj:162 },{ month:"Apr",actual:183,proj:175 },
  { month:"May",actual:195,proj:188 },{ month:"Jun",actual:210,proj:200 },
  { month:"Jul",actual:228,proj:215 },{ month:"Aug",actual:241,proj:230 },
  { month:"Sep",actual:256,proj:245 },{ month:"Oct",actual:272,proj:260 },
  { month:"Nov",actual:265,proj:275 },{ month:"Dec",actual:null,proj:290 },
];

const LOCATIONS = [
  { name:"SoHo · NYC", revenue:87400, orders:3240, rating:4.9, staff:14, since:"2021" },
  { name:"West Loop · CHI", revenue:72100, orders:2890, rating:4.8, staff:12, since:"2022" },
  { name:"Capitol Hill · SEA", revenue:68800, orders:2650, rating:4.9, staff:11, since:"2022" },
  { name:"Silver Lake · LA", revenue:65300, orders:2510, rating:4.7, staff:10, since:"2023" },
  { name:"Mission · SF", revenue:63200, orders:2440, rating:4.8, staff:10, since:"2023" },
];

const DAILY = [
  {t:"7am",o:45},{t:"8am",o:112},{t:"9am",o:148},{t:"10am",o:98},
  {t:"11am",o:76},{t:"12pm",o:95},{t:"1pm",o:88},{t:"2pm",o:62},
  {t:"3pm",o:74},{t:"4pm",o:82},{t:"5pm",o:55},{t:"6pm",o:34},
];

const PROJ_3YR = [
  { year:"Y1",locations:5,revenue:4.1,ebitda:0.6 },
  { year:"Y2",locations:12,revenue:9.8,ebitda:1.9 },
  { year:"Y3",locations:25,revenue:21.2,ebitda:4.8 },
];

const INIT_ORDERS = [
  { id:"VO-2847",customer:"Emma R.",items:["Flat White","Kouign-Amann"],total:11.00,status:"new",time:"2m",station:"Bar 1" },
  { id:"VO-2848",customer:"James T.",items:["V60 Pour Over","Almond Croissant"],total:12.00,status:"making",time:"5m",station:"Bar 2" },
  { id:"VO-2849",customer:"Sofia K.",items:["Nitro Cold Brew","Nitro Cold Brew"],total:14.00,status:"making",time:"7m",station:"Bar 1" },
  { id:"VO-2850",customer:"Marcus L.",items:["Cortado"],total:5.00,status:"ready",time:"8m",station:"Bar 2" },
  { id:"VO-2851",customer:"Priya N.",items:["Oat Milk Latte","Cardamom Knot"],total:10.00,status:"new",time:"1m",station:null },
];

const DB_SCHEMA = [
  { domain:"Users", color:"#4A9EE8", tables:[
    { name:"users", fields:["id UUID PK","email VARCHAR UNIQUE","name VARCHAR","phone VARCHAR","role ENUM(customer,staff,admin)","created_at TIMESTAMP","loyalty_tier ENUM(bronze,silver,gold,platinum)"] },
    { name:"staff_shifts", fields:["id UUID PK","user_id UUID FK→users","location_id UUID FK→locations","start_time TIMESTAMP","end_time TIMESTAMP","role VARCHAR","break_minutes INT"] },
  ]},
  { domain:"Locations", color:"#52B380", tables:[
    { name:"locations", fields:["id UUID PK","name VARCHAR","city VARCHAR","state VARCHAR","address TEXT","lat DECIMAL","lng DECIMAL","timezone VARCHAR","opened_date DATE","is_active BOOLEAN"] },
    { name:"location_hours", fields:["id UUID PK","location_id UUID FK→locations","day_of_week INT","open_time TIME","close_time TIME","is_closed BOOLEAN"] },
  ]},
  { domain:"Menu", color:"#C4803C", tables:[
    { name:"menu_categories", fields:["id UUID PK","name VARCHAR","slug VARCHAR UNIQUE","display_order INT","is_active BOOLEAN","icon_url VARCHAR"] },
    { name:"menu_items", fields:["id UUID PK","category_id UUID FK→menu_categories","name VARCHAR","description TEXT","base_price DECIMAL","calories INT","is_active BOOLEAN","is_seasonal BOOLEAN","image_url VARCHAR"] },
    { name:"item_variants", fields:["id UUID PK","item_id UUID FK→menu_items","variant_type VARCHAR","variant_value VARCHAR","price_delta DECIMAL","is_default BOOLEAN"] },
  ]},
  { domain:"Orders", color:"#E05C5C", tables:[
    { name:"orders", fields:["id UUID PK","order_number VARCHAR UNIQUE","customer_id UUID FK→users","location_id UUID FK→locations","status ENUM(pending,making,ready,completed,cancelled)","total DECIMAL","tax DECIMAL","tip DECIMAL","channel ENUM(in_store,mobile,kiosk)","created_at TIMESTAMP","completed_at TIMESTAMP"] },
    { name:"order_items", fields:["id UUID PK","order_id UUID FK→orders","item_id UUID FK→menu_items","quantity INT","unit_price DECIMAL","customizations JSONB","notes TEXT"] },
    { name:"payments", fields:["id UUID PK","order_id UUID FK→orders","amount DECIMAL","method ENUM(card,cash,apple_pay,google_pay,loyalty)","stripe_payment_intent VARCHAR","status ENUM(pending,captured,refunded)","processed_at TIMESTAMP"] },
  ]},
  { domain:"Loyalty", color:"#D4A84B", tables:[
    { name:"loyalty_accounts", fields:["id UUID PK","user_id UUID FK→users","points_balance INT","lifetime_points INT","tier ENUM","tier_expiry DATE","created_at TIMESTAMP"] },
    { name:"loyalty_transactions", fields:["id UUID PK","account_id UUID FK→loyalty_accounts","order_id UUID FK→orders","points_delta INT","transaction_type ENUM(earn,redeem,expire,bonus)","description VARCHAR","created_at TIMESTAMP"] },
  ]},
  { domain:"Inventory", color:"#8C6B52", tables:[
    { name:"inventory_items", fields:["id UUID PK","location_id UUID FK→locations","sku VARCHAR","name VARCHAR","unit VARCHAR","quantity DECIMAL","reorder_threshold DECIMAL","supplier_id UUID"] },
    { name:"inventory_transactions", fields:["id UUID PK","item_id UUID FK→inventory_items","delta DECIMAL","type ENUM(received,used,wasted,adjusted)","reference_id UUID","recorded_by UUID FK→users","created_at TIMESTAMP"] },
  ]},
];

const TECH_STACK = [
  { layer:"Client Layer", color:"#4A9EE8", items:[
    { name:"React Native", note:"iOS & Android customer app" },
    { name:"Next.js 14", note:"Web ordering + Admin dashboard" },
    { name:"Expo", note:"OTA updates, push notifications" },
  ]},
  { layer:"API Gateway", color:"#D4A84B", items:[
    { name:"AWS API Gateway", note:"Rate limiting, auth, routing" },
    { name:"Kong", note:"Plugin-based middleware chain" },
  ]},
  { layer:"Microservices", color:"#C4803C", items:[
    { name:"Order Service", note:"Node.js · order lifecycle" },
    { name:"Menu Service", note:"Node.js · catalog management" },
    { name:"User Service", note:"Node.js · auth & profiles" },
    { name:"Payment Service", note:"Node.js · Stripe integration" },
    { name:"Loyalty Service", note:"Node.js · points engine" },
    { name:"Inventory Service", note:"Node.js · stock management" },
    { name:"Notification Service", note:"Node.js · push/email/SMS" },
  ]},
  { layer:"Data Layer", color:"#52B380", items:[
    { name:"PostgreSQL (RDS)", note:"Primary relational store" },
    { name:"Redis (ElastiCache)", note:"Sessions, cache, pub/sub" },
    { name:"S3 + CloudFront", note:"Media assets, CDN" },
    { name:"Elasticsearch", note:"Menu search & analytics" },
  ]},
  { layer:"Infrastructure", color:"#8C6B52", items:[
    { name:"AWS ECS (Fargate)", note:"Containerized workloads" },
    { name:"GitHub Actions", note:"CI/CD pipelines" },
    { name:"Datadog", note:"APM, logs, alerts" },
    { name:"Socket.io", note:"Real-time POS updates" },
  ]},
];

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Tag = ({ children, color = C.caramel }) => (
  <span style={{ fontFamily:body,fontSize:10,fontWeight:600,letterSpacing:"0.08em",
    textTransform:"uppercase",padding:"2px 8px",borderRadius:99,
    background:`${color}22`,color,border:`1px solid ${color}44` }}>
    {children}
  </span>
);

const KpiCard = ({ label, value, sub, color = C.caramel }) => (
  <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,
    padding:"20px 22px",display:"flex",flexDirection:"column",gap:6 }}>
    <div style={{ fontFamily:body,fontSize:11,fontWeight:600,letterSpacing:"0.1em",
      textTransform:"uppercase",color:C.textSecondary }}>{label}</div>
    <div style={{ fontFamily:display,fontSize:32,fontWeight:600,color,lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontFamily:body,fontSize:12,color:C.muted }}>{sub}</div>}
  </div>
);

const SectionTitle = ({ eyebrow, title, sub }) => (
  <div style={{ marginBottom:28 }}>
    {eyebrow && <div style={{ fontFamily:body,fontSize:11,fontWeight:600,letterSpacing:"0.14em",
      textTransform:"uppercase",color:C.caramel,marginBottom:8 }}>{eyebrow}</div>}
    <div style={{ fontFamily:display,fontSize:38,fontWeight:300,color:C.cream,lineHeight:1.15,
      fontStyle:"italic" }}>{title}</div>
    {sub && <div style={{ fontFamily:body,fontSize:14,color:C.textSecondary,marginTop:8,
      maxWidth:540,lineHeight:1.6 }}>{sub}</div>}
  </div>
);

// ─── VIEWS ────────────────────────────────────────────────────────────────────

function BrandView() {
  const palette = [
    { name:"Espresso", hex:"#160C06" },{ name:"Dark Roast", hex:"#2E1A0E" },
    { name:"Caramel", hex:"#C4803C" },{ name:"Gold", hex:"#D4A84B" },
    { name:"Cream", hex:"#F5E4CC" },{ name:"Steam", hex:"#FBF3E6" },
  ];
  return (
    <div style={{ padding:"36px 40px",overflowY:"auto",height:"100%" }}>
      {/* Masthead */}
      <div style={{ display:"flex",alignItems:"flex-start",gap:32,marginBottom:48,
        paddingBottom:40,borderBottom:`1px solid ${C.border}` }}>
        <div style={{ width:88,height:88,borderRadius:20,
          background:`linear-gradient(135deg, ${C.surfaceHigh} 0%, ${C.caramel}33 100%)`,
          border:`1px solid ${C.borderBright}`,display:"flex",alignItems:"center",
          justifyContent:"center",flexShrink:0 }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path d="M22 4 L26 16 L38 16 L28 24 L32 36 L22 28 L12 36 L16 24 L6 16 L18 16 Z"
              fill={C.caramel} opacity="0.9"/>
            <circle cx="22" cy="22" r="18" stroke={C.gold} strokeWidth="1.5" fill="none" opacity="0.4"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontFamily:display,fontSize:54,fontWeight:600,color:C.cream,
            letterSpacing:"0.04em",lineHeight:1,margin:0 }}>VOLTA</h1>
          <div style={{ fontFamily:body,fontSize:14,color:C.caramel,letterSpacing:"0.12em",
            textTransform:"uppercase",marginTop:6 }}>Coffee Co. · Est. 2021</div>
          <div style={{ fontFamily:display,fontSize:18,fontStyle:"italic",color:C.mutedLight,
            marginTop:8 }}>"Every cup, a current."</div>
        </div>
        <div style={{ marginLeft:"auto",display:"flex",gap:10 }}>
          <Tag>5 Locations</Tag>
          <Tag color={C.success}>Series A</Tag>
          <Tag color={C.gold}>$4.1M ARR</Tag>
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:32 }}>
        {/* Brand Story */}
        <div>
          <div style={{ fontFamily:body,fontSize:11,fontWeight:600,letterSpacing:"0.14em",
            textTransform:"uppercase",color:C.caramel,marginBottom:14 }}>Brand Story</div>
          <div style={{ fontFamily:display,fontSize:22,fontWeight:300,fontStyle:"italic",
            color:C.cream,lineHeight:1.5,marginBottom:16 }}>
            Named after the electrical unit of potential difference — the force that moves energy from one place to another.
          </div>
          <div style={{ fontFamily:body,fontSize:13.5,color:C.textSecondary,lineHeight:1.8,marginBottom:12 }}>
            Volta Coffee Co. was founded on the belief that exceptional coffee is an act of precision and care. We source directly from 14 farms across Ethiopia, Colombia, Guatemala, and Yemen, building multi-year relationships with producers who share our obsession with quality.
          </div>
          <div style={{ fontFamily:body,fontSize:13.5,color:C.textSecondary,lineHeight:1.8 }}>
            Each location is designed as a neighborhood anchor — a place where creative professionals, students, and morning regulars feel the same unhurried sense of belonging. No rush. No noise. Just coffee, done with intent.
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <div style={{ fontFamily:body,fontSize:11,fontWeight:600,letterSpacing:"0.14em",
            textTransform:"uppercase",color:C.caramel,marginBottom:14 }}>Brand Palette</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
            {palette.map(p => (
              <div key={p.name} style={{ borderRadius:8,overflow:"hidden",
                border:`1px solid ${C.border}` }}>
                <div style={{ height:52,background:p.hex }} />
                <div style={{ background:C.surface,padding:"6px 10px" }}>
                  <div style={{ fontFamily:body,fontSize:11,fontWeight:600,color:C.cream }}>{p.name}</div>
                  <div style={{ fontFamily:body,fontSize:10,color:C.muted }}>{p.hex}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Typography */}
          <div style={{ marginTop:24 }}>
            <div style={{ fontFamily:body,fontSize:11,fontWeight:600,letterSpacing:"0.14em",
              textTransform:"uppercase",color:C.caramel,marginBottom:14 }}>Typography</div>
            <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:16 }}>
              <div style={{ fontFamily:display,fontSize:28,fontWeight:600,fontStyle:"italic",
                color:C.cream,lineHeight:1 }}>Cormorant Garamond</div>
              <div style={{ fontFamily:body,fontSize:11,color:C.muted,marginTop:4,marginBottom:12 }}>
                Display / Headlines / Brand Voice
              </div>
              <div style={{ fontFamily:body,fontSize:16,color:C.cream }}>Outfit</div>
              <div style={{ fontFamily:body,fontSize:11,color:C.muted,marginTop:4 }}>
                UI / Body / Data / Labels
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Locations */}
      <div style={{ marginTop:36 }}>
        <div style={{ fontFamily:body,fontSize:11,fontWeight:600,letterSpacing:"0.14em",
          textTransform:"uppercase",color:C.caramel,marginBottom:14 }}>Current Footprint</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10 }}>
          {LOCATIONS.map(loc => (
            <div key={loc.name} style={{ background:C.surface,border:`1px solid ${C.border}`,
              borderRadius:10,padding:"14px 16px" }}>
              <div style={{ fontFamily:display,fontSize:15,fontWeight:600,color:C.cream,
                lineHeight:1.2,marginBottom:4 }}>{loc.name}</div>
              <div style={{ fontFamily:body,fontSize:11,color:C.muted }}>Since {loc.since}</div>
              <div style={{ marginTop:10,display:"flex",alignItems:"center",gap:4 }}>
                <span style={{ fontFamily:body,fontSize:11,color:C.gold }}>★ {loc.rating}</span>
                <span style={{ fontFamily:body,fontSize:11,color:C.muted,marginLeft:4 }}>{loc.staff} staff</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BusinessView() {
  const custom = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:C.surfaceHigh,border:`1px solid ${C.borderBright}`,
        borderRadius:8,padding:"10px 14px",fontFamily:body,fontSize:12,color:C.cream }}>
        <div style={{ fontWeight:600,marginBottom:4 }}>{label}</div>
        {payload.map(p => (
          <div key={p.key} style={{ color:p.color }}>{p.name}: ${p.value}K</div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding:"36px 40px",overflowY:"auto",height:"100%" }}>
      <SectionTitle eyebrow="Business Plan" title="Unit Economics & Growth Strategy"
        sub="Multi-location specialty coffee chain targeting premium urban markets. Direct-trade sourcing, tech-forward operations, loyalty-driven retention." />

      {/* KPIs */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:32 }}>
        <KpiCard label="Current ARR" value="$4.1M" sub="5 locations · YoY +32%" />
        <KpiCard label="Avg Unit Revenue" value="$820K" sub="Top unit: $1.04M (SoHo)" color={C.gold} />
        <KpiCard label="Avg Ticket Size" value="$9.40" sub="Mobile channel: $12.20" color={C.amber} />
        <KpiCard label="Loyalty Members" value="28,400" sub="62% monthly active" color={C.success} />
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"3fr 2fr",gap:24,marginBottom:24 }}>
        {/* Revenue Chart */}
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px" }}>
          <div style={{ fontFamily:body,fontSize:11,fontWeight:600,letterSpacing:"0.1em",
            textTransform:"uppercase",color:C.textSecondary,marginBottom:4 }}>2024 Monthly Revenue</div>
          <div style={{ fontFamily:display,fontSize:20,fontWeight:600,color:C.cream,
            marginBottom:16 }}>All Locations Combined ($K)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA} margin={{ top:5,right:5,bottom:0,left:0 }}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.caramel} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.caramel} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.gold} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={C.gold} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill:C.muted,fontFamily:body,fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:C.muted,fontFamily:body,fontSize:11 }} axisLine={false} tickLine={false} width={36}/>
              <Tooltip content={custom}/>
              <Area type="monotone" dataKey="proj" name="Projected" stroke={C.gold} strokeWidth={1.5}
                fill="url(#gp)" strokeDasharray="4 4"/>
              <Area type="monotone" dataKey="actual" name="Actual" stroke={C.caramel} strokeWidth={2.5}
                fill="url(#ga)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Unit Economics */}
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px" }}>
          <div style={{ fontFamily:body,fontSize:11,fontWeight:600,letterSpacing:"0.1em",
            textTransform:"uppercase",color:C.textSecondary,marginBottom:16 }}>Unit P&L · Avg Location</div>
          {[
            { label:"Gross Revenue", value:"$820K", pct:100, color:C.cream },
            { label:"COGS (Beans + Food)", value:"−$230K", pct:28, color:C.error },
            { label:"Labor", value:"−$262K", pct:32, color:C.error },
            { label:"Occupancy / Rent", value:"−$98K", pct:12, color:C.error },
            { label:"OpEx & G&A", value:"−$82K", pct:10, color:C.warning },
            { label:"EBITDA", value:"$148K", pct:18, color:C.success, bold:true },
          ].map(row => (
            <div key={row.label} style={{ marginBottom:10 }}>
              <div style={{ display:"flex",justifyContent:"space-between",
                fontFamily:body,fontSize:12,color:row.color,fontWeight:row.bold?600:400,
                marginBottom:4 }}>
                <span>{row.label}</span>
                <span>{row.value}</span>
              </div>
              <div style={{ height:3,background:C.surfaceHigh,borderRadius:2 }}>
                <div style={{ height:"100%",width:`${row.pct}%`,
                  background:row.color,borderRadius:2,opacity:0.7 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Year Plan */}
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px" }}>
        <div style={{ fontFamily:body,fontSize:11,fontWeight:600,letterSpacing:"0.1em",
          textTransform:"uppercase",color:C.textSecondary,marginBottom:16 }}>3-Year Expansion Plan</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
          {PROJ_3YR.map((y,i) => (
            <div key={y.year} style={{ background:C.surfaceHigh,borderRadius:10,padding:"18px 20px",
              border:`1px solid ${i===0?C.borderBright:C.border}` }}>
              {i===0 && <Tag>Current</Tag>}
              <div style={{ fontFamily:display,fontSize:28,fontWeight:600,color:C.caramel,
                marginTop:i===0?8:0 }}>{y.year}</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12 }}>
                <div>
                  <div style={{ fontFamily:body,fontSize:10,color:C.muted,textTransform:"uppercase",
                    letterSpacing:"0.08em" }}>Locations</div>
                  <div style={{ fontFamily:display,fontSize:24,color:C.cream }}>{y.locations}</div>
                </div>
                <div>
                  <div style={{ fontFamily:body,fontSize:10,color:C.muted,textTransform:"uppercase",
                    letterSpacing:"0.08em" }}>Revenue</div>
                  <div style={{ fontFamily:display,fontSize:24,color:C.cream }}>${y.revenue}M</div>
                </div>
                <div>
                  <div style={{ fontFamily:body,fontSize:10,color:C.muted,textTransform:"uppercase",
                    letterSpacing:"0.08em" }}>EBITDA</div>
                  <div style={{ fontFamily:display,fontSize:24,color:C.success }}>${y.ebitda}M</div>
                </div>
                <div>
                  <div style={{ fontFamily:body,fontSize:10,color:C.muted,textTransform:"uppercase",
                    letterSpacing:"0.08em" }}>Margin</div>
                  <div style={{ fontFamily:display,fontSize:24,color:C.gold }}>
                    {Math.round((y.ebitda/y.revenue)*100)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArchView() {
  return (
    <div style={{ padding:"36px 40px",overflowY:"auto",height:"100%" }}>
      <SectionTitle eyebrow="Technical Architecture" title="Microservices · Cloud-Native"
        sub="Event-driven architecture built for scale. Each service owns its domain and deploys independently. Zero-downtime deployments, 99.95% SLA target." />

      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        {TECH_STACK.map(layer => (
          <div key={layer.layer} style={{ background:C.surface,border:`1px solid ${C.border}`,
            borderRadius:12,padding:"16px 20px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
              <div style={{ width:10,height:10,borderRadius:"50%",background:layer.color,flexShrink:0 }}/>
              <div style={{ fontFamily:body,fontSize:11,fontWeight:700,letterSpacing:"0.12em",
                textTransform:"uppercase",color:layer.color }}>{layer.layer}</div>
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:10 }}>
              {layer.items.map(item => (
                <div key={item.name} style={{ background:C.surfaceHigh,border:`1px solid ${layer.color}33`,
                  borderRadius:8,padding:"10px 14px",display:"flex",flexDirection:"column",
                  gap:3,minWidth:160 }}>
                  <div style={{ fontFamily:body,fontSize:13,fontWeight:600,color:C.cream }}>{item.name}</div>
                  <div style={{ fontFamily:body,fontSize:11,color:C.muted }}>{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ADRs */}
      <div style={{ marginTop:24,background:C.surface,border:`1px solid ${C.border}`,
        borderRadius:12,padding:"20px 22px" }}>
        <div style={{ fontFamily:body,fontSize:11,fontWeight:600,letterSpacing:"0.1em",
          textTransform:"uppercase",color:C.textSecondary,marginBottom:16 }}>Key Architecture Decisions</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          {[
            { q:"Why microservices over monolith?", a:"Independent deploy cadence per team. Order service ships 3x/week; menu service ships monthly. Separate scaling profile for POS real-time vs analytics batch." },
            { q:"Why PostgreSQL as primary DB?", a:"JSONB for flexible item customizations, strong ACID guarantees for payment records, mature tooling. Each service owns its own schema namespace." },
            { q:"Why Redis for sessions/cache?", a:"Sub-millisecond loyalty point lookups during checkout, POS pub/sub for real-time order status broadcast across all staff terminals." },
            { q:"Why React Native + Expo?", a:"Single codebase for iOS/Android reduces mobile team headcount. Expo EAS enables OTA updates without app store approval — critical for menu changes." },
          ].map(adr => (
            <div key={adr.q} style={{ background:C.surfaceHigh,borderRadius:8,padding:"14px 16px" }}>
              <div style={{ fontFamily:body,fontSize:12,fontWeight:600,color:C.amber,marginBottom:6 }}>{adr.q}</div>
              <div style={{ fontFamily:body,fontSize:12,color:C.textSecondary,lineHeight:1.7 }}>{adr.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DBView() {
  const [activeDomain, setActiveDomain] = useState("Orders");
  const domain = DB_SCHEMA.find(d => d.domain === activeDomain);

  return (
    <div style={{ padding:"36px 40px",height:"100%",display:"flex",flexDirection:"column" }}>
      <SectionTitle eyebrow="Database Schema" title="PostgreSQL · 6 Domains · 14 Tables"
        sub="UUID primary keys throughout. Soft deletes via is_active flags. All monetary values stored as DECIMAL(10,2). JSONB for flexible customizations." />

      <div style={{ display:"flex",gap:10,marginBottom:24,flexWrap:"wrap" }}>
        {DB_SCHEMA.map(d => (
          <button key={d.domain} onClick={() => setActiveDomain(d.domain)}
            style={{ fontFamily:body,fontSize:12,fontWeight:600,padding:"7px 16px",borderRadius:99,
              cursor:"pointer",transition:"all 0.15s",
              background:activeDomain===d.domain ? d.color : C.surface,
              color:activeDomain===d.domain ? C.bg : C.mutedLight,
              border:`1px solid ${activeDomain===d.domain ? d.color : C.border}` }}>
            {d.domain}
          </button>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,flex:1,overflow:"auto" }}>
        {domain?.tables.map(table => (
          <div key={table.name} style={{ background:C.surface,border:`1px solid ${domain.color}44`,
            borderRadius:12,overflow:"hidden" }}>
            <div style={{ background:`${domain.color}22`,padding:"12px 16px",
              borderBottom:`1px solid ${domain.color}33`,
              display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:8,height:8,borderRadius:2,background:domain.color }}/>
              <span style={{ fontFamily:body,fontSize:13,fontWeight:700,color:C.cream,
                fontVariantNumeric:"tabular-nums" }}>{table.name}</span>
            </div>
            <div style={{ padding:"10px 0" }}>
              {table.fields.map((f,i) => {
                const [col, ...rest] = f.split(" ");
                const isPk = f.includes("PK");
                const isFk = f.includes("FK");
                return (
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:10,
                    padding:"6px 16px",
                    background:i%2===0?"transparent":"rgba(255,255,255,0.015)" }}>
                    {isPk && <span style={{ fontFamily:body,fontSize:9,color:C.gold,
                      border:`1px solid ${C.gold}55`,borderRadius:3,padding:"1px 4px",
                      flexShrink:0 }}>PK</span>}
                    {isFk && <span style={{ fontFamily:body,fontSize:9,color:C.new,
                      border:`1px solid ${C.new}55`,borderRadius:3,padding:"1px 4px",
                      flexShrink:0 }}>FK</span>}
                    {!isPk && !isFk && <span style={{ width:22,flexShrink:0 }}/>}
                    <span style={{ fontFamily:"'Courier New',monospace",fontSize:12,
                      color:C.cream,flexShrink:0 }}>{col}</span>
                    <span style={{ fontFamily:body,fontSize:11,color:C.muted }}>
                      {rest.join(" ").replace(/PK|FK→\S+/g,"").trim()}
                    </span>
                    {isFk && <span style={{ fontFamily:body,fontSize:10,color:C.new,
                      marginLeft:"auto",flexShrink:0,opacity:0.7 }}>
                      → {f.match(/FK→(\S+)/)?.[1]}
                    </span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomerView() {
  const [cat, setCat] = useState("espresso");
  const [cart, setCart] = useState([]);
  const [added, setAdded] = useState(null);

  const addItem = (item) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) return prev.map(i => i.id===item.id ? {...i,qty:i.qty+1} : i);
      return [...prev, {...item, qty:1}];
    });
    setAdded(item.id);
    setTimeout(() => setAdded(null), 800);
  };

  const total = cart.reduce((s,i) => s + i.price*i.qty, 0);
  const points = Math.floor(total * 10);

  const cats = [
    { key:"espresso", label:"Espresso" },
    { key:"pourover", label:"Pour Over" },
    { key:"coldbrew", label:"Cold Brew" },
    { key:"pastries", label:"Pastries" },
  ];

  return (
    <div style={{ display:"flex",height:"100%",overflow:"hidden" }}>
      {/* Main */}
      <div style={{ flex:1,padding:"28px 32px",overflowY:"auto" }}>
        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
          <div>
            <div style={{ fontFamily:display,fontSize:26,fontWeight:600,fontStyle:"italic",
              color:C.cream }}>Good morning, Alex</div>
            <div style={{ fontFamily:body,fontSize:13,color:C.muted,marginTop:3 }}>
              SoHo · New York · ★ 4.9 · Open until 7pm
            </div>
          </div>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,
            padding:"10px 16px",textAlign:"right" }}>
            <div style={{ fontFamily:body,fontSize:10,color:C.muted,textTransform:"uppercase",
              letterSpacing:"0.08em" }}>Loyalty Points</div>
            <div style={{ fontFamily:display,fontSize:22,color:C.gold }}>2,840</div>
            <Tag color={C.gold}>Gold Member</Tag>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display:"flex",gap:8,marginBottom:20 }}>
          {cats.map(c => (
            <button key={c.key} onClick={() => setCat(c.key)}
              style={{ fontFamily:body,fontSize:12,fontWeight:600,padding:"8px 18px",
                borderRadius:99,cursor:"pointer",transition:"all 0.15s",
                background:cat===c.key ? C.caramel : C.surface,
                color:cat===c.key ? C.bg : C.mutedLight,
                border:`1px solid ${cat===c.key ? C.caramel : C.border}` }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Items */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          {(MENU[cat]||[]).map(item => (
            <div key={item.id} style={{ background:C.surface,border:`1px solid ${C.border}`,
              borderRadius:12,padding:"16px 18px",display:"flex",flexDirection:"column",
              gap:6,transition:"border-color 0.15s",
              borderColor:added===item.id ? C.caramel : C.border }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                <div style={{ fontFamily:body,fontSize:14,fontWeight:600,color:C.cream,
                  flex:1,marginRight:12 }}>{item.name}</div>
                {item.tag && <Tag>{item.tag}</Tag>}
              </div>
              <div style={{ fontFamily:body,fontSize:12,color:C.muted,lineHeight:1.5 }}>{item.desc}</div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4 }}>
                <div>
                  <span style={{ fontFamily:display,fontSize:20,fontWeight:600,color:C.caramel }}>
                    ${item.price.toFixed(2)}
                  </span>
                  <span style={{ fontFamily:body,fontSize:11,color:C.muted,marginLeft:8 }}>{item.cal} cal</span>
                </div>
                <button onClick={() => addItem(item)}
                  style={{ background:added===item.id ? C.success : C.caramel,
                    color:C.bg,border:"none",borderRadius:8,padding:"7px 16px",
                    fontFamily:body,fontSize:12,fontWeight:700,cursor:"pointer",
                    transition:"background 0.2s" }}>
                  {added===item.id ? "Added ✓" : "+ Add"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div style={{ width:280,borderLeft:`1px solid ${C.border}`,padding:"24px 20px",
        display:"flex",flexDirection:"column",background:C.dark }}>
        <div style={{ fontFamily:display,fontSize:22,fontWeight:600,fontStyle:"italic",
          color:C.cream,marginBottom:20 }}>Your Order</div>

        {cart.length === 0 ? (
          <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:body,fontSize:13,color:C.muted,textAlign:"center",lineHeight:1.7 }}>
            Add items from the menu to start your order
          </div>
        ) : (
          <>
            <div style={{ flex:1,overflowY:"auto" }}>
              {cart.map(item => (
                <div key={item.id} style={{ display:"flex",justifyContent:"space-between",
                  alignItems:"center",padding:"10px 0",
                  borderBottom:`1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontFamily:body,fontSize:12,fontWeight:600,color:C.cream }}>{item.name}</div>
                    <div style={{ fontFamily:body,fontSize:11,color:C.muted }}>×{item.qty}</div>
                  </div>
                  <div style={{ fontFamily:body,fontSize:13,color:C.caramel }}>
                    ${(item.price*item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:16,paddingTop:16,borderTop:`1px solid ${C.border}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",
                fontFamily:body,fontSize:12,color:C.muted,marginBottom:8 }}>
                <span>Subtotal</span><span>${total.toFixed(2)}</span>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",
                fontFamily:body,fontSize:12,color:C.gold,marginBottom:16 }}>
                <span>Points earned</span><span>+{points} pts</span>
              </div>
              <button style={{ width:"100%",background:C.caramel,color:C.bg,border:"none",
                borderRadius:10,padding:"13px 0",fontFamily:body,fontSize:14,fontWeight:700,
                cursor:"pointer" }}>
                Place Order · ${total.toFixed(2)}
              </button>
              <div style={{ fontFamily:body,fontSize:11,color:C.muted,textAlign:"center",marginTop:8 }}>
                Est. wait: 4–6 min
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function POSView() {
  const [orders, setOrders] = useState(INIT_ORDERS);

  const advance = (id) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = { new:"making", making:"ready", ready:"completed" }[o.status];
      return next === "completed" ? null : {...o, status:next,
        station: o.station || `Bar ${Math.ceil(Math.random()*2)}`};
    }).filter(Boolean));
  };

  const statuses = ["new","making","ready"];
  const statusLabel = { new:"New Orders", making:"In Progress", ready:"Ready" };
  const actionLabel = { new:"Start Making", making:"Mark Ready", ready:"Picked Up" };
  const statusColor = { new:C.new, making:C.warning, ready:C.success };

  return (
    <div style={{ padding:"24px 32px",height:"100%",overflow:"hidden",display:"flex",
      flexDirection:"column" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:display,fontSize:28,fontWeight:600,fontStyle:"italic",
            color:C.cream }}>POS Terminal</div>
          <div style={{ fontFamily:body,fontSize:12,color:C.muted,marginTop:2 }}>
            SoHo · New York · Shift: 7am–3pm · Barista: Jordan M.
          </div>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <KpiCard label="Today's Orders" value={orders.length + 47} sub="" />
          <KpiCard label="Avg Wait" value="4.2m" sub="" color={C.gold} />
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,flex:1,overflow:"hidden" }}>
        {statuses.map(status => (
          <div key={status} style={{ display:"flex",flexDirection:"column",
            background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,
            overflow:"hidden" }}>
            <div style={{ padding:"12px 16px",borderBottom:`1px solid ${C.border}`,
              display:"flex",justifyContent:"space-between",alignItems:"center",
              background:`${statusColor[status]}11` }}>
              <div style={{ fontFamily:body,fontSize:11,fontWeight:700,
                textTransform:"uppercase",letterSpacing:"0.1em",color:statusColor[status] }}>
                {statusLabel[status]}
              </div>
              <div style={{ fontFamily:body,fontSize:12,fontWeight:700,
                color:statusColor[status],background:`${statusColor[status]}22`,
                borderRadius:99,width:22,height:22,display:"flex",
                alignItems:"center",justifyContent:"center" }}>
                {orders.filter(o=>o.status===status).length}
              </div>
            </div>
            <div style={{ flex:1,overflowY:"auto",padding:"10px" }}>
              {orders.filter(o=>o.status===status).map(order => (
                <div key={order.id} style={{ background:C.surfaceHigh,borderRadius:10,
                  padding:"12px 14px",marginBottom:8,
                  border:`1px solid ${statusColor[status]}33` }}>
                  <div style={{ display:"flex",justifyContent:"space-between",
                    marginBottom:6 }}>
                    <span style={{ fontFamily:body,fontSize:12,fontWeight:700,
                      color:C.cream }}>{order.id}</span>
                    <span style={{ fontFamily:body,fontSize:11,color:C.muted }}>{order.time}</span>
                  </div>
                  <div style={{ fontFamily:body,fontSize:13,color:C.amber,marginBottom:6 }}>
                    {order.customer}
                  </div>
                  {order.items.map((item,i) => (
                    <div key={i} style={{ fontFamily:body,fontSize:12,color:C.textSecondary,
                      marginBottom:2 }}>· {item}</div>
                  ))}
                  <div style={{ display:"flex",justifyContent:"space-between",
                    alignItems:"center",marginTop:10 }}>
                    <span style={{ fontFamily:body,fontSize:11,color:C.muted }}>
                      {order.station || "Unassigned"}
                    </span>
                    <span style={{ fontFamily:display,fontSize:16,color:C.caramel }}>
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                  <button onClick={() => advance(order.id)}
                    style={{ marginTop:10,width:"100%",background:statusColor[status],
                      color:C.bg,border:"none",borderRadius:7,padding:"7px 0",
                      fontFamily:body,fontSize:11,fontWeight:700,cursor:"pointer",
                      opacity:0.9 }}>
                    {actionLabel[status]}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsView() {
  const customTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:C.surfaceHigh,border:`1px solid ${C.borderBright}`,
        borderRadius:8,padding:"8px 12px",fontFamily:body,fontSize:12,color:C.cream }}>
        <div style={{ fontWeight:600 }}>{label}</div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ color:C.caramel }}>{p.value} orders</div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding:"36px 40px",overflowY:"auto",height:"100%" }}>
      <SectionTitle eyebrow="Analytics Dashboard" title="Network Performance · Live"
        sub="Real-time data across 5 locations. Updated every 60 seconds." />

      {/* KPIs */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28 }}>
        <KpiCard label="Today's Revenue" value="$18,420" sub="+12% vs last Fri" />
        <KpiCard label="Orders Today" value="869" sub="Avg ticket $21.20" color={C.gold} />
        <KpiCard label="New Customers" value="47" sub="14% of today's traffic" color={C.new} />
        <KpiCard label="Loyalty Redeemed" value="$1,240" sub="68 redemptions" color={C.success} />
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"3fr 2fr",gap:20,marginBottom:20 }}>
        {/* Hourly Orders */}
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,
          padding:"20px 22px" }}>
          <div style={{ fontFamily:body,fontSize:11,fontWeight:600,letterSpacing:"0.1em",
            textTransform:"uppercase",color:C.textSecondary,marginBottom:4 }}>Hourly Order Volume</div>
          <div style={{ fontFamily:display,fontSize:18,fontWeight:600,color:C.cream,marginBottom:16 }}>
            Today · All Locations
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={DAILY} margin={{ top:5,right:5,bottom:0,left:0 }}>
              <XAxis dataKey="t" tick={{ fill:C.muted,fontFamily:body,fontSize:11 }}
                axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:C.muted,fontFamily:body,fontSize:11 }}
                axisLine={false} tickLine={false} width={30}/>
              <Tooltip content={customTip}/>
              <Bar dataKey="o" fill={C.caramel} radius={[4,4,0,0]} opacity={0.85}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Items */}
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,
          padding:"20px 22px" }}>
          <div style={{ fontFamily:body,fontSize:11,fontWeight:600,letterSpacing:"0.1em",
            textTransform:"uppercase",color:C.textSecondary,marginBottom:16 }}>Top Items Today</div>
          {[
            { name:"Flat White", count:312, pct:100 },
            { name:"Oat Milk Latte", count:287, pct:92 },
            { name:"Nitro Cold Brew", count:241, pct:77 },
            { name:"V60 Pour Over", count:198, pct:63 },
            { name:"Kouign-Amann", count:164, pct:53 },
          ].map((item,i) => (
            <div key={item.name} style={{ marginBottom:11 }}>
              <div style={{ display:"flex",justifyContent:"space-between",
                fontFamily:body,fontSize:12,color:C.cream,marginBottom:4 }}>
                <span>{i+1}. {item.name}</span>
                <span style={{ color:C.caramel }}>{item.count}</span>
              </div>
              <div style={{ height:3,background:C.surfaceHigh,borderRadius:2 }}>
                <div style={{ height:"100%",width:`${item.pct}%`,
                  background:C.caramel,borderRadius:2 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Table */}
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,
        overflow:"hidden" }}>
        <div style={{ padding:"14px 20px",borderBottom:`1px solid ${C.border}`,
          display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",gap:10 }}>
          {["Location","Monthly Rev","Orders","Rating","Staff","Status"].map(h => (
            <div key={h} style={{ fontFamily:body,fontSize:10,fontWeight:700,
              textTransform:"uppercase",letterSpacing:"0.1em",color:C.muted }}>{h}</div>
          ))}
        </div>
        {LOCATIONS.map((loc,i) => (
          <div key={loc.name} style={{ padding:"13px 20px",
            background:i%2===0?"transparent":C.surfaceHigh,
            display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",
            gap:10,alignItems:"center" }}>
            <div style={{ fontFamily:body,fontSize:13,fontWeight:600,color:C.cream }}>{loc.name}</div>
            <div style={{ fontFamily:display,fontSize:16,color:C.caramel }}>
              ${(loc.revenue/1000).toFixed(0)}K
            </div>
            <div style={{ fontFamily:body,fontSize:13,color:C.textSecondary }}>{loc.orders.toLocaleString()}</div>
            <div style={{ fontFamily:body,fontSize:13,color:C.gold }}>★ {loc.rating}</div>
            <div style={{ fontFamily:body,fontSize:13,color:C.textSecondary }}>{loc.staff} people</div>
            <Tag color={C.success}>Active</Tag>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const NAV = [
  { key:"brand", label:"Brand", icon:"◈" },
  { key:"business", label:"Business Plan", icon:"↗" },
  { key:"arch", label:"Architecture", icon:"⊞" },
  { key:"db", label:"Database", icon:"⊛" },
  { key:"customer", label:"Customer App", icon:"◉" },
  { key:"pos", label:"POS Terminal", icon:"⊡" },
  { key:"analytics", label:"Analytics", icon:"⊿" },
];

export default function VoltaApp() {
  const [tab, setTab] = useState("brand");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch(e){} };
  }, []);

  const views = { brand:<BrandView/>, business:<BusinessView/>, arch:<ArchView/>,
    db:<DBView/>, customer:<CustomerView/>, pos:<POSView/>, analytics:<AnalyticsView/> };

  return (
    <div style={{ display:"flex",height:"100vh",background:C.bg,fontFamily:body,overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:200,background:C.dark,borderRight:`1px solid ${C.border}`,
        display:"flex",flexDirection:"column",flexShrink:0 }}>
        <div style={{ padding:"24px 18px 20px",borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontFamily:display,fontSize:22,fontWeight:600,letterSpacing:"0.06em",
            color:C.cream }}>VOLTA</div>
          <div style={{ fontFamily:body,fontSize:10,letterSpacing:"0.14em",
            textTransform:"uppercase",color:C.caramel,marginTop:2 }}>Coffee Co.</div>
        </div>
        <div style={{ padding:"10px 8px",flex:1 }}>
          {NAV.map(n => (
            <button key={n.key} onClick={() => setTab(n.key)}
              style={{ width:"100%",display:"flex",alignItems:"center",gap:10,
                padding:"9px 12px",borderRadius:8,border:"none",cursor:"pointer",
                marginBottom:2,textAlign:"left",transition:"all 0.12s",
                background:tab===n.key ? `${C.caramel}1A` : "transparent",
                borderLeft:tab===n.key ? `2px solid ${C.caramel}` : "2px solid transparent" }}>
              <span style={{ fontSize:14,color:tab===n.key ? C.caramel : C.muted }}>{n.icon}</span>
              <span style={{ fontFamily:body,fontSize:12,fontWeight:tab===n.key?600:400,
                color:tab===n.key ? C.cream : C.mutedLight }}>{n.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding:"14px 18px",borderTop:`1px solid ${C.border}` }}>
          <div style={{ fontFamily:body,fontSize:10,color:C.muted,lineHeight:1.6 }}>
            v2.4.1 · Production<br/>
            <span style={{ color:C.success }}>● All systems nominal</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1,overflow:"hidden",display:"flex",flexDirection:"column" }}>
        {/* Top bar */}
        <div style={{ height:48,borderBottom:`1px solid ${C.border}`,
          display:"flex",alignItems:"center",padding:"0 32px",
          justifyContent:"space-between",flexShrink:0,background:C.dark }}>
          <div style={{ fontFamily:body,fontSize:12,color:C.muted }}>
            Volta Coffee Co. · Multi-Location Management Suite
          </div>
          <div style={{ display:"flex",gap:16,alignItems:"center" }}>
            <div style={{ fontFamily:body,fontSize:12,color:C.textSecondary }}>
              5 Locations Active
            </div>
            <div style={{ width:7,height:7,borderRadius:"50%",background:C.success }}/>
            <div style={{ fontFamily:body,fontSize:12,color:C.success }}>Live</div>
          </div>
        </div>
        {/* View */}
        <div style={{ flex:1,overflow:"hidden" }}>
          {views[tab]}
        </div>
      </div>
    </div>
  );
}
