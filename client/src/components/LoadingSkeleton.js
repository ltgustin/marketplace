import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const AssetsSkeleton = () => (
    <div className="assets-skeleton">
        <div className="assets-grid-skeleton">
            {Array(8).fill().map((_, i) => (
                <div key={i} className="asset-card-skeleton">
                    <Skeleton height={200} /> {/* Asset image */}
                    <div className="p-4">
                        <Skeleton count={2} /> {/* Asset details */}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const UserDataSkeleton = () => (
    <div className="user-data-skeleton">
        <Skeleton width={200} className="mb-2" /> {/* Address */}
        <Skeleton width={150} /> {/* Token amount */}
    </div>
);

export const ShopSkeleton = () => (
    <div className="shop-skeleton">
        <Skeleton height={40} className="mb-4" /> {/* Shop header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill().map((_, i) => (
                <div key={i} className="shop-item-skeleton">
                    <Skeleton height={150} /> {/* Item image */}
                    <div className="p-4">
                        <Skeleton count={3} /> {/* Item details */}
                    </div>
                </div>
            ))}
        </div>
    </div>
);