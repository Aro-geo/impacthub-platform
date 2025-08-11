import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Database } from 'lucide-react';

const MinimalTest = () => {
    const { user, userProfile, loading } = useAuth();

    return (
        <Card className="bg-green-50 border-green-200">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Simple Lesson Dashboard - Minimal Test</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm">Dashboard Loading:</span>
                    <Badge variant={loading ? 'destructive' : 'default'}>
                        {loading ? 'Loading...' : 'Loaded'}
                    </Badge>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm">User Authentication:</span>
                    <Badge variant={user ? 'default' : 'destructive'}>
                        {user ? (
                            <><User className="h-3 w-3 mr-1" /> Authenticated</>
                        ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Not Authenticated</>
                        )}
                    </Badge>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm">User Profile:</span>
                    <Badge variant={userProfile ? 'default' : 'secondary'}>
                        {userProfile ? (
                            <><Database className="h-3 w-3 mr-1" /> Loaded</>
                        ) : (
                            'Not Loaded'
                        )}
                    </Badge>
                </div>

                {userProfile && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Profile Info:</strong><br />
                        Name: {userProfile.name || 'Not set'}<br />
                        Grade: {userProfile.grade || 'Not set'}<br />
                        Email: {userProfile.email || 'Not set'}
                    </div>
                )}

                <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                    ✅ <strong>Dashboard Status:</strong> Components are loading successfully!<br />
                    If you can see this message, the Simple Lesson Dashboard is working.
                </div>

                <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                    <strong>Next Steps:</strong><br />
                    1. Check the diagnostic tool above for detailed status<br />
                    2. Click "Load Sample Data" to populate lessons<br />
                    3. Navigate through the tabs (Overview, Lessons, Practice, Community)
                </div>
            </CardContent>
        </Card>
    );
};

export default MinimalTest;