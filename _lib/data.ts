import { BedsBathsType, OptionsType, USA_State } from "@/components/types";

export const temp_codes = [
    { "code": "{{firstname}}", "description": "User's firstname" },
    { "code": "{{lastname}}", "description": "User's lastname" },
    { "code": "{{email}}", "description": "User's primary email" },
    { "code": "{{phone_1}}", "description": "User's primary phone number" },
    { "code": "{{our_company_name}}", "description": "Our company name" },
    { "code": "{{our_default_email}}", "description": "Our default email" },
    { "code": "{{our_phone_number}}", "description": "Our phone number" },
    { "code": "{{our_address_1}}", "description": "Our address 1" },
    { "code": "{{our_address_2}}", "description": "Our address 2" },
    { "code": "{{our_facebook}}", "description": "Our facebook page" },
    { "code": "{{our_instagram}}", "description": "Our instagram page" },
    { "code": "{{our_x/twitter}}", "description": "Our twitter page" },
    { "code": "{{our_youtube}}", "description": "Our youtube page" },
    { "code": "{{our_tiktok}}", "description": "Our tiktok page" },
    { "code": "{{our_logo}}", "description": "Our logo" },
]


export const admin_invite_email = `<p>Dear [Team Member's Name],</p>
    
    <p>I hope this email finds you well.</p>
    
    <p>We need you to complete your registration on our web application.</p>
    
    <p>Please follow the link below to finish setting up your account:
        <a href="[BASE_URL]/admin/reset-password?email=[account_email]&token=[token]">
        Setup Your Password
        </a>
    </p>
    
    <p>Once registered, you will have access to all the tools and resources you need to get started. If you encounter any
    issues or have any questions during the registration process, please do not hesitate to reach out.</p>
    
    <p>Thank you for your prompt attention to this matter. We look forward to your active participation and contributions to our team.</p>
    
    <p>Best regards,</p>
    <p>[APP_NAME]</p>`;


export const LeadStages = ["Prospects", "Tenant", "Archived"]
export const DateTypes = ["Move In Date", "Move Out Date"]

export const usa_states: USA_State[] = [
  { name: '--Please choose a state--', code: '' },
  { name: 'Alabama', code: 'AL' },
  { name: 'Alaska', code: 'AK' },
  { name: 'Arizona', code: 'AZ' },
  { name: 'Arkansas', code: 'AR' },
  { name: 'California', code: 'CA' },
  { name: 'Colorado', code: 'CO' },
  { name: 'Connecticut', code: 'CT' },
  { name: 'Delaware', code: 'DE' },
  { name: 'Florida', code: 'FL' },
  { name: 'Georgia', code: 'GA' },
  { name: 'Hawaii', code: 'HI' },
  { name: 'Idaho', code: 'ID' },
  { name: 'Illinois', code: 'IL' },
  { name: 'Indiana', code: 'IN' },
  { name: 'Iowa', code: 'IA' },
  { name: 'Kansas', code: 'KS' },
  { name: 'Kentucky', code: 'KY' },
  { name: 'Louisiana', code: 'LA' },
  { name: 'Maine', code: 'ME' },
  { name: 'Maryland', code: 'MD' },
  { name: 'Massachusetts', code: 'MA' },
  { name: 'Michigan', code: 'MI' },
  { name: 'Minnesota', code: 'MN' },
  { name: 'Mississippi', code: 'MS' },
  { name: 'Missouri', code: 'MO' },
  { name: 'Montana', code: 'MT' },
  { name: 'Nebraska', code: 'NE' },
  { name: 'Nevada', code: 'NV' },
  { name: 'New Hampshire', code: 'NH' },
  { name: 'New Jersey', code: 'NJ' },
  { name: 'New Mexico', code: 'NM' },
  { name: 'New York', code: 'NY' },
  { name: 'North Carolina', code: 'NC' },
  { name: 'North Dakota', code: 'ND' },
  { name: 'Ohio', code: 'OH' },
  { name: 'Oklahoma', code: 'OK' },
  { name: 'Oregon', code: 'OR' },
  { name: 'Pennsylvania', code: 'PA' },
  { name: 'Rhode Island', code: 'RI' },
  { name: 'South Carolina', code: 'SC' },
  { name: 'South Dakota', code: 'SD' },
  { name: 'Tennessee', code: 'TN' },
  { name: 'Texas', code: 'TX' },
  { name: 'Utah', code: 'UT' },
  { name: 'Vermont', code: 'VT' },
  { name: 'Virginia', code: 'VA' },
  { name: 'Washington', code: 'WA' },
  { name: 'West Virginia', code: 'WV' },
  { name: 'Wisconsin', code: 'WI' },
  { name: 'Wyoming', code: 'WY' },
];

export const countries: USA_State[] = [
  { name: 'United States', code: 'United States' }
]

export const beds: OptionsType[] = [
  { name: 'Studio', code: '0' },
  { name: '1', code: '1' },
  { name: '2', code: '2' },
  { name: '3', code: '3' },
  { name: '4', code: '4' },
  { name: '5', code: '5' },
  { name: '6', code: '6' },
  { name: '7', code: '7' },
  { name: '8', code: '8' },
  { name: '9', code: '9' },
  { name: '10', code: '10' }
]

export const baths: OptionsType[] = [
  { name: '-', code: '0' },
  { name: '1', code: '1' },
  { name: '1.5', code: '1.5' },
  { name: '2', code: '2' },
  { name: '2.5', code: '2.5' },
  { name: '3', code: '3' },
  { name: '3.5', code: '3.5' },
  { name: '4', code: '4' },
  { name: '4.5', code: '4.5' },
  { name: '5', code: '5' },
  { name: '5.5', code: '5.5' },
  { name: '6', code: '6' },
  { name: '6.5', code: '6.5' },
  { name: '7', code: '7' },
  { name: '7.5', code: '7.5' },
  { name: '8', code: '8' },
  { name: '8.5', code: '8.5' },
  { name: '9', code: '9' },
  { name: '9.5', code: '9.5' },
  { name: '10', code: '10' }
]

export const yes_or_no: OptionsType[] = [
  { name: 'Yes', code: 'Yes' },
  { name: 'No', code: 'No' },
]

export const parkings: OptionsType[] = [
  { name: 'Yes', code: 'Yes' },
  { name: 'No', code: 'No' },
  { name: 'Third Party', code: 'Third Party' },
]

export const parkingsFee: OptionsType[] = [
  { name: 'Yes', code: 'Yes' },
  { name: 'No', code: 'No' },
  { name: 'Call For Information', code: 'Call For Information' },
]

export const time_options: OptionsType[] = [
  { name: '12:00 AM', code: '12:00 AM' },
  { name: '1:00 AM', code: '1:00 AM' },
  { name: '2:00 AM', code: '2:00 AM' },
  { name: '3:00 AM', code: '3:00 AM' },
  { name: '4:00 AM', code: '4:00 AM' },
  { name: '5:00 AM', code: '5:00 AM' },
  { name: '6:00 AM', code: '6:00 AM' },
  { name: '7:00 AM', code: '7:00 AM' },
  { name: '8:00 AM', code: '8:00 AM' },
  { name: '9:00 AM', code: '9:00 AM' },
  { name: '10:00 AM', code: '10:00 AM' },
  { name: '11:00 AM', code: '11:00 AM' },
  { name: '12:00 PM', code: '12:00 PM' },
  { name: '1:00 PM', code: '1:00 PM' },
  { name: '2:00 PM', code: '2:00 PM' },
  { name: '3:00 PM', code: '3:00 PM' },
  { name: '4:00 PM', code: '4:00 PM' },
  { name: '5:00 PM', code: '5:00 PM' },
  { name: '6:00 PM', code: '6:00 PM' },
  { name: '7:00 PM', code: '7:00 PM' },
  { name: '8:00 PM', code: '8:00 PM' },
  { name: '9:00 PM', code: '9:00 PM' },
  { name: '10:00 PM', code: '10:00 PM' },
  { name: '11:00 PM', code: '11:00 PM' }
]

export const PropertyStatus: OptionsType[] = [
  { name: 'Vacant', code: 'Vacant' },
  { name: 'Occupied', code: 'Occupied' },
]

export const Beds_Baths : BedsBathsType[] = [
    {"value":1, text:"1"},
    {"value":2, text:"2"},
    {"value":3, text:"3"},
    {"value":4, text:"4"},
    {"value":5, text:"5"},
    {"value":6, text:"6"},
    {"value":7, text:"7"},
    {"value":8, text:"8+"},
]

export const grayMapStyleX = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }]
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#f5f5f5' }]
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bdbdbd' }]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#eeeeee' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e5e5e5' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#dadada' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }]
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }]
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#e5e5e5' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#eeeeee' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c9c9c9' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }]
  }
];

export const grayMapStyle =  [
  {
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "landscape",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "stylers": [
      {
        "color": "#d3dfee"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#d3dfee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d3dfee"
      }
    ]
  }
]
