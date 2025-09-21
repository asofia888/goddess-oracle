import React from 'react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out animate-fadeInModal"
      onClick={onClose}
    >
      <div
        className="bg-violet-50 border border-amber-200/50 rounded-2xl shadow-2xl shadow-amber-500/20 w-11/12 max-w-2xl max-h-[90vh] flex flex-col animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 sm:p-6 border-b border-amber-200/50 text-center relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-orange-800 tracking-wide">ご利用マニュアル</h2>
          <button onClick={onClose} className="absolute top-3 right-3 p-2 text-amber-700/80 hover:bg-amber-200/50 rounded-full" aria-label="閉じる">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto flex-grow text-stone-700 space-y-4 text-sm leading-relaxed">
            <p>この度は、「女神のオラクルガイダンス」をご利用いただき、誠にありがとうございます。このアプリは、48人の女神たちの叡智を通じて、あなたの心に寄り添うメッセージをお届けするツールです。</p>
            
            <h3 className="text-lg font-bold text-amber-800 pt-2">1. リーディングモードを選択する</h3>
            <p>アプリを開くと、まず2つのリーディングモードが表示されます。目的に合わせてお好きな方をお選びください。</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong>1枚引き (Single Card Reading):</strong> 今日のメッセージ、特定の質問に対するアドバイス、あるいはインスピレーションが欲しい時におすすめです。</li>
                <li><strong>3枚引き (Three Card Reading):</strong> ある状況について、「過去」「現在」「未来」という時間の流れに沿って、より深く洞察したい時におすすめです。</li>
            </ul>
            <p>モードを切り替えると、カードは自動的にシャッフルされます。</p>

            <h3 className="text-lg font-bold text-amber-800 pt-2">2. カードを選ぶ</h3>
            <p>画面に裏向きに並べられたカードの中から、心が惹かれるものを直感で選んでください。</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                 <li><strong>1枚引きの場合:</strong> カードを1枚タップすると、すぐに結果が表示されます。</li>
                 <li><strong>3枚引きの場合:</strong> 「過去」「現在」「未来」を示すカードを1枚ずつ、合計3枚選びます。3枚選び終えると、「結果を見る」ボタンが表示されるので、そちらをタップしてください。</li>
            </ul>

            <h3 className="text-lg font-bold text-amber-800 pt-2">3. メッセージを受け取る</h3>
            <p>カードを選ぶと、結果画面が表示され、女神からのメッセージを受け取ることができます。メッセージと画像はAI技術を用いて、より深い洞察を提供するために生成されています。</p>

            <h3 className="text-lg font-bold text-amber-800 pt-2">4. リーディング履歴を確認する</h3>
            <p>ホーム画面の右上にある本のアイコンをタップすると、「リーディング履歴」画面が開きます。過去のリーディング結果を一覧で確認したり、不要になった履歴を削除したりすることができます。</p>

            <h3 className="text-lg font-bold text-amber-800 pt-2">ご注意</h3>
            <p>本アプリが提供するリーディング結果やメッセージは、エンターテイメントを目的としています。表示される内容は、医学、法律、金融など、専門的な助言に代わるものではありません。人生における重要な決定は、ご自身の判断と責任において行ってください。</p>
        </div>
        
        <footer className="p-4 sm:p-6 border-t border-amber-200/50 text-right">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
            >
              閉じる
            </button>
          </footer>
      </div>
      <style>{`
        @keyframes fadeInModal { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeInModal { animation: fadeInModal 0.3s ease-in-out; }
        .animate-zoomIn { animation: zoomIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ManualModal;
