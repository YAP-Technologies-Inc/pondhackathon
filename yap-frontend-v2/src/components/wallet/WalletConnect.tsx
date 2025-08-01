'use client';

import { useMetaMask } from './MetaMaskProvider';

export default function WalletConnect() {
  const { account, balance, isConnected, connect, disconnect, switchToSepolia, forceAccountSelection } = useMetaMask();

  const handleConnect = async () => {
    try {
      await switchToSepolia();
      await connect();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSwitchAccount = async () => {
    try {
      await forceAccountSelection();
    } catch (error) {
      console.error('Error switching account:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex justify-center">
        <button
          onClick={handleConnect}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Connect MetaMask
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Connected Wallet</h3>
          <p className="text-sm text-gray-600">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
          <p className="text-sm text-gray-600">
            Balance: {parseFloat(balance).toFixed(4)} ETH
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSwitchAccount}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition-colors"
          >
            Switch Account
          </button>
          <button
            onClick={handleDisconnect}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
} 