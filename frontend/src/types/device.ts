type DeviceType = {
    name: string;
    type: 'mobile' | 'desktop' | 'tablet' | 'other';
    status: 'active' | 'inactive';
    ipAddress: string;
};

export default DeviceType;
