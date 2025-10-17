import { Map } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Button from '../../../components/Button';

const ZoningDashboard = () => {

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex-shrink-0 mb-4 pb-2">
                <div className="flex justify-between items-start">
                    <Header 
                        variant="secondary"
                        title="Zoning Clearance Application"
                        subtext="Manage zoning applications and compliance reviews."
                    />
                    
          {/* Controls next to header */}
          <div className="flex items-center gap-3">
            <Button variant="outlined" icon={<Map size={16} />}>
              View Map
            </Button>
          </div>
                </div>
            </div>
        </div>
    );
};

// Add default layout for persistent sidebar/topnav
ZoningDashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default ZoningDashboard;
