"use client";

import { Butterfly_Kids, Elsie, Margarine } from "next/font/google";
import styles from "./page.module.css";
import { useState, useRef, type RefObject, type KeyboardEvent, useEffect } from "react";

export default function Page() {

  //型の定義
  type ManualTrade = {
    id: string;
    side: "buy" | "sell" | "";
    typ: string;
    tim: string;
    qty: string;
    jpy: string;
    fee: string;
  };
  type category = {
    id: string;
    name: string;
    qty: string;
    jpy: string;
  }
  type TradeValue = {
    qty: number;
    jpy: number;
    fee: number;
  }
  type TradeDict = Record<
    string,
    Record<
      number,
      Partial<Record<Side, TradeValue>>
    >
  >;



  type Side = "buy" | "sell";
  type repotrade = {
    id: string;
    typ: string;
    oqty: string;
    ojpy: string;
    bqty: string;
    bjpy: string;
    sqty: string;
    sjpy: string;
  }


  const now = new Date();
  const todayJST =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");


  //stateの定義
  const [manualTrades, setManualTrades] = useState<ManualTrade[]>([]);
  // 復元（初回のみ）
  useEffect(() => {
    const saved = localStorage.getItem("manualTrades");
    if (!saved) return;

    try {
      setManualTrades(JSON.parse(saved) as ManualTrade[]);
    } catch {
      localStorage.removeItem("manualTrades");
    }
  }, []);

  // 保存（manualTrades が変わるたび）
  useEffect(() => {
    localStorage.setItem("manualTrades", JSON.stringify(manualTrades));
  }, [manualTrades]);

  const [emptyManualTrade, setEmptyManualTrade] = useState<ManualTrade>({
    id: crypto.randomUUID(),
    side: "",
    typ: "",
    tim: "",
    qty: "",
    jpy: "",
    fee: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingManualTradeId, setEditingManualTradeId] = useState("");
  const [sbError, setSbError] = useState<boolean>(false);
  const [openInfo, setOpenInfo] = useState<category[]>([{
    id: crypto.randomUUID(),
    name: "",
    qty: "",
    jpy: ""
  }]);
  const [isOtherMap, setIsOtherMap] = useState<Record<string, boolean>>({});
  const [otherNames, setOtherNames] = useState<Record<string, string>>({});
  const [nameLengthError, setNameLengthError] = useState<Record<string, string>>({});
  const [step, setStep] = useState<number>(1);
  const [mResult, setMResult] = useState("-")
  const [error, setError] = useState<Boolean>(false)
  const [MorR, setMorR] = useState<"M" | "R">("M")
  const [repoTrades, setRepoTrades] = useState<repotrade[]>([]);
  const [targetYear, setTargetYear] = useState<string>(
    String(new Date().getFullYear())
  );
  // 給与
  const [hasSalary, setHasSalary] = useState<boolean | null>(null);
  const [salaryAmount, setSalaryAmount] = useState<string>("");

  // 事業
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(null);
  const [businessAmount, setBusinessAmount] = useState<string>("");

  // 暗号資産以外の雑所得
  const [hasOtherMisc, setHasOtherMisc] = useState<boolean | null>(null);
  const [otherMiscAmount, setOtherMiscAmount] = useState<string>("");

  // 学生かどうか
  const [isStudent, setIsStudent] = useState<boolean | null>(null);
  const [isBlueReturn, setIsBlueReturn] = useState<boolean | null>(null);
  // 1. 青色申告しているか？

  const [isDoubleEntry, setIsDoubleEntry] = useState<boolean | null>(null);
  // 2. 帳簿は複式簿記か？

  const [isETaxOrElectronicBooks, setIsETaxOrElectronicBooks] =
    useState<boolean | null>(null);
  // 3. e-Tax または 電子帳簿保存をしているか？
  const [tax, setTax] = useState(0)
  const [canApply, setCanApply] = useState(false)

  const [otherIncome, setOtherIncome] = useState(0)
  const [pnlTotalState, setPnlTotalState] = useState<number>(0);
  const [pushed, setPushed] = useState(false)





  //関数
  const stripComma = (s: string) => s.replace(/,/g, "");
  const addComma = (digits: string) => {
    if (digits === "") return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  function handleEnterMove<T extends HTMLElement>(nextRef: RefObject<T>) {
    return (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        nextRef.current?.focus();
      }
    };
  }
  const num = (s: string) => {
    if (s === "") {
      return 0;
    }
    return Number(s);
  }
  const getYear = (s: string) => { return Number(s.slice(0, 4)) }
  const progTax = (n: number) => {
    if (!Number.isFinite(n)) return 0;
    if (n <= 1950000) { return n * 0.05 }
    if (1950000 < n && n <= 3300000) { return (n * 0.1 - 97500) }
    if (3300000 < n && n <= 6950000) { return (n * 0.2 - 427500) }
    if (6950000 < n && n <= 9000000) { return (n * 0.23 - 636000) }
    if (9000000 < n && n <= 18000000) { return (n * 0.33 - 1536000) }
    if (18000000 < n && n <= 40000000) { return (n * 0.4 - 2796000) }
    if (40000000 < n) { return (n * 0.45 - 4796000) }
    return 0;
  }
  const salDed = (n: number) => {
    if (n <= 1625000) { return Math.max(n - 550000, 0) }
    if (1625000 < n && n <= 1800000) { return Math.max(n - (n * 0.4 - 100000), 0) }
    if (1800000 < n && n <= 3600000) { return Math.max(n - (n * 0.3 + 80000), 0) }
    if (3600000 < n && n <= 6600000) { return Math.max(n - (n * 0.2 + 440000), 0) }
    if (6600000 < n && n <= 8500000) { return Math.max(n - (n * 0.1 + 1100000), 0) }
    if (8500000 < n) { return Math.max(n - 1950000, 0) }
    return 0
  }
  const bizDed = (n: number) => {
    if (isBlueReturn === true) {
      if (isDoubleEntry === true) {
        if (isETaxOrElectronicBooks === true) {
          return Math.max(n - 650000, 0)
        }
        return Math.max(n - 550000, 0)
      }
      return Math.max(n - 100000, 0)
    }
    return 0
  }
  const basicDed = (n: number) => {
    if (Number(targetYear) <= 2024) {
      if (n <= 23500000) { return Math.max(n - 480000, 0) }
      return n
    }
    if (Number(targetYear) === 2025 || Number(targetYear) === 2026) {
      if (n <= 1320000) { return Math.max(n - 950000, 0) }
      if (1320000 < n && n <= 3360000) { return Math.max(n - 880000, 0) }
      if (3360000 < n && n <= 4890000) { return Math.max(n - 680000, 0) }
      if (4890000 < n && n <= 6550000) { return Math.max(n - 630000, 0) }
      if (6550000 < n && n <= 23500000) { return Math.max(n - 580000, 0) }
      if (23500000 < n) { return n }
      return 0
    }
    if (Number(targetYear) >= 2027) {
      if (n <= 1320000) { return Math.max(n - 580000, 0) }
      if (1320000 < n && n <= 23500000) { return n }
      if (23500000 < n) { return n }
      return 0

    }
  }


  //変数
  const OTHER = "__OTHER__";
  const sideRef = useRef<HTMLSelectElement>(null!);
  const typRef = useRef<HTMLSelectElement>(null!);
  const qtyRef = useRef<HTMLInputElement>(null!);
  const jpyRef = useRef<HTMLInputElement>(null!);
  const feeRef = useRef<HTMLInputElement>(null!);
  const submitBtnRef = useRef<HTMLButtonElement>(null!);
  const editBtnRef = useRef<HTMLButtonElement>(null!);
  let pnlTotal: number = 0;   // ← ここは文なので最後に ; を付ける
  let tradeDict: TradeDict = {}; // 辞書の実体
  let years: number[] = [];
  let coins: string[] = [];
  let holdingQty = 0
  let aveCost = 0
  let totalCost = 0
  let incomeTax = 0
  let stuIncomeTax = 0
  let qryptTax = 0
  let stuQryptTax = 0
  let totalIncome = 0




  return (



    <div className={styles.page}>

      <header className={styles.siteHeader}>
        <div className={styles.logoBlock}>
          <img
            src="/coin-memo-logo.png"   // 透過PNG
            alt="Coin Memo"
            className={styles.logo}
          />
          <p className={styles.tagline}>
            暗号資産の取引履歴から、確定申告の目安を確認できます
          </p>
        </div>
      </header>

      <div className={styles.container}>

        <div className={styles.card}>
          <div className={styles.cardTitle}>あなたの所得について</div>

          <div className={styles.formBlock}>
            <div className={styles.qRow}>
              <div className={styles.qLabel}>
                給与収入はありますか？
                <div className={styles.qHint}>
                  （アルバイト・パート・会社からの給料など）
                </div>
              </div>

              <div className={styles.qRight}>
                <div className={styles.radioRow}>
                  <label className={styles.radioItem}>
                    <input
                      type="radio"
                      name="hasSalary"
                      checked={hasSalary === true}
                      onChange={() => setHasSalary(true)}
                    />
                    はい
                  </label>
                  <label className={styles.radioItem}>
                    <input
                      type="radio"
                      name="hasSalary"
                      checked={hasSalary === false}
                      onChange={() => {
                        setHasSalary(false);
                        setSalaryAmount("");
                      }}
                    />
                    いいえ
                  </label>
                </div>

                {hasSalary === true && (
                  <div className={styles.moneyRow}>
                    <input
                      className={styles.input}
                      placeholder="給与収入を入力(年間)"
                      value={salaryAmount}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!/^(?:|0|[1-9]\d*)$/.test(v)) return;
                        setSalaryAmount(v);
                      }}
                    />
                    <div className={styles.unit}>円</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formBlock}>
            <div className={styles.qRow}>
              <div className={styles.qLabel}>
                事業所得はありますか？
                <div className={styles.qHint}>
                  （フリーランス・個人事業・副業など）
                </div>
              </div>

              <div className={styles.qRight}>
                <div className={styles.radioRow}>
                  <label className={styles.radioItem}>
                    <input
                      type="radio"
                      name="hasBusiness"
                      checked={hasBusiness === true}
                      onChange={() => setHasBusiness(true)}
                    />
                    はい
                  </label>
                  <label className={styles.radioItem}>
                    <input
                      type="radio"
                      name="hasBusiness"
                      checked={hasBusiness === false}
                      onChange={() => {
                        setHasBusiness(false);
                        setBusinessAmount("");
                        setIsBlueReturn(null);
                        setIsDoubleEntry(null);
                        setIsETaxOrElectronicBooks(null);
                      }}
                    />
                    いいえ
                  </label>
                </div>

                {hasBusiness === true && (
                  <div className={styles.moneyRow}>
                    <input
                      className={styles.input}
                      placeholder="事業所得を入力(年間)"
                      value={businessAmount}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!/^(?:|0|[1-9]\d*)$/.test(v)) return;
                        setBusinessAmount(v);
                      }}
                    />
                    <div className={styles.unit}>円</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* hasBusiness === true の追加質問も同じ qRow 構造にすると揃います */}
          {hasBusiness === true && (
            <div className={styles.formBlock}>
              <div className={styles.qRow}>
                <div className={styles.qLabel}>青色申告をした/する予定がある</div>

                <div className={styles.qRight}>
                  <div className={styles.radioRow}>
                    <label className={styles.radioItem}>
                      <input
                        type="radio"
                        name="isBlueReturn"
                        checked={isBlueReturn === true}
                        onChange={() => setIsBlueReturn(true)}
                      />
                      はい
                    </label>
                    <label className={styles.radioItem}>
                      <input
                        type="radio"
                        name="isBlueReturn"
                        checked={isBlueReturn === false}
                        onChange={() => setIsBlueReturn(false)}
                      />
                      いいえ
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasBusiness === true && (
            <div className={styles.formBlock}>
              <div className={styles.qRow}>
                <div className={styles.qLabel}>帳簿は複式簿記ですか？</div>

                <div className={styles.qRight}>
                  <div className={styles.radioRow}>
                    <label className={styles.radioItem}>
                      <input
                        type="radio"
                        name="isDoubleEntry"
                        checked={isDoubleEntry === true}
                        onChange={() => setIsDoubleEntry(true)}
                      />
                      はい
                    </label>
                    <label className={styles.radioItem}>
                      <input
                        type="radio"
                        name="isDoubleEntry"
                        checked={isDoubleEntry === false}
                        onChange={() => setIsDoubleEntry(false)}
                      />
                      いいえ
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasBusiness === true && (
            <div className={styles.formBlock}>
              <div className={styles.qRow}>
                <div className={styles.qLabel}>e-Taxまたは電子帳簿保存ですか？</div>

                <div className={styles.qRight}>
                  <div className={styles.radioRow}>
                    <label className={styles.radioItem}>
                      <input
                        type="radio"
                        name="isETaxOrElectronicBooks"
                        checked={isETaxOrElectronicBooks === true}
                        onChange={() => setIsETaxOrElectronicBooks(true)}
                      />
                      はい
                    </label>
                    <label className={styles.radioItem}>
                      <input
                        type="radio"
                        name="isETaxOrElectronicBooks"
                        checked={isETaxOrElectronicBooks === false}
                        onChange={() => setIsETaxOrElectronicBooks(false)}
                      />
                      いいえ
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.formBlock}>
            <div className={styles.qRow}>
              <div className={styles.qLabel}>
                暗号資産以外の雑所得はありますか？
                <div className={styles.qHint}>
                  （原稿料・講演料・ポイント収入など）
                </div>
              </div>
              <div className={styles.qRight}>
                <div className={styles.radioRow}>
                  <label className={styles.radioItem}>
                    <input
                      type="radio"
                      name="hasOtherMisc"
                      checked={hasOtherMisc === true}
                      onChange={() => setHasOtherMisc(true)}
                    />
                    はい
                  </label>
                  <label className={styles.radioItem}>
                    <input
                      type="radio"
                      name="hasOtherMisc"
                      checked={hasOtherMisc === false}
                      onChange={() => {
                        setHasOtherMisc(false);
                        setOtherMiscAmount("");
                      }}
                    />
                    いいえ
                  </label>
                </div>

                {hasOtherMisc === true && (
                  <div className={styles.moneyRow}>
                    <input
                      className={styles.input}
                      placeholder="その他雑所得を入力(年間)"
                      value={otherMiscAmount}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!/^(?:|0|[1-9]\d*)$/.test(v)) return;
                        setOtherMiscAmount(v);
                      }}
                    />
                    <div className={styles.unit}>円</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formBlock}>
            <div className={styles.qRow}>
              <div className={styles.qLabel}>学生ですか？</div>

              <div className={styles.qRight}>
                <div className={styles.radioRow}>
                  <label className={styles.radioItem}>
                    <input
                      type="radio"
                      name="isStudent"
                      checked={isStudent === true}
                      onChange={() => setIsStudent(true)}
                    />
                    はい
                  </label>
                  <label className={styles.radioItem}>
                    <input
                      type="radio"
                      name="isStudent"
                      checked={isStudent === false}
                      onChange={() => setIsStudent(false)}
                    />
                    いいえ
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>




        <div className={`${styles.card} ${isEditing ? styles.editingCard : ""}`}>
          <div className={styles.cardTitle}>暗号資産の取引情報の入力</div>
          <div className={styles.cardDesc}>
            この画面でこれまでの全取引内容を入力してください。
          </div>
          {isEditing && (
            <div className={styles.cardSubTitle}>
              修正中の取引
            </div>
          )}
          {isEditing && <span className={styles.editingBadge}>修正モード</span>}
          <div className={styles.formRow}>
            <div className={styles.formLabel}>取引日</div>
            <div className={styles.formControl}>
              <input
                type="date"
                className={styles.input}
                value={emptyManualTrade.tim}
                onChange={(e) => {
                  setEmptyManualTrade(prev => ({
                    ...prev,
                    tim: e.target.value,
                  })
                  )
                }}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formLabel}>取引の種類</div>
            <div className={styles.formControl}>
              <select
                className={styles.select}
                ref={sideRef}
                value={emptyManualTrade.side}
                onChange={(e) => {
                  const value = e.target.value as "buy" | "sell" | "";
                  setEmptyManualTrade((prev) => ({
                    ...prev,
                    side: e.target.value as "buy" | "sell" | "",
                  }));
                  if (value !== "") {
                    typRef.current?.focus();
                  }

                }}
              >
                <option value="" disabled>
                  選択してください
                </option>

                <option value="buy">購入 (買い)</option>
                <option value="sell">売却 (売り)</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formLabel}>通貨</div>
            <div className={styles.formControl}>
              <select
                className={styles.select}
                ref={typRef}
                value={emptyManualTrade.typ}
                onChange={(e) => {
                  const v = e.target.value;
                  setEmptyManualTrade((prev) => ({
                    ...prev,
                    typ: v,
                  }));
                  if (v !== "") {
                    qtyRef.current?.focus();
                  }
                }}
              >
                <option value="" disabled>選択してください</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="XRP">XRP</option>
                <option value="SOL">SOL</option>
                <option value="USDT">USDT</option>
                <option value="BNB">BNB</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          </div>




          <div className={styles.formRow}>
            <div className={styles.formLabel}>取引数量</div>
            <div className={styles.formControl}>
              <input
                className={styles.input}
                ref={qtyRef}
                onKeyDown={handleEnterMove(jpyRef)}
                value={emptyManualTrade.qty}
                onChange={(e) => {
                  if (!/^(?:0|[1-9]\d*)(?:\.\d*)?$/.test(e.target.value) && e.target.value !== "") return;
                  setEmptyManualTrade(prev => ({
                    ...prev,
                    qty: e.target.value,
                  })
                  )
                }}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formLabel}>取引金額</div>
            <div className={styles.formControl}>
              <input
                className={styles.input}
                ref={jpyRef}
                onKeyDown={handleEnterMove(feeRef)}
                value={emptyManualTrade.jpy}
                onChange={(e) => {
                  if (!/^(|0|[1-9][0-9]*)$/.test(e.target.value)) return;
                  setEmptyManualTrade(prev => ({
                    ...prev,
                    jpy: e.target.value,
                  })
                  )
                }}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formLabel}>手数料</div>
            <div className={styles.formControl}>
              <input
                className={styles.input}
                ref={feeRef}
                onKeyDown={handleEnterMove(
                  isEditing ? editBtnRef : submitBtnRef
                )}
                value={emptyManualTrade.fee}
                onChange={(e) => {
                  if (!/^(|0|[1-9][0-9]*)$/.test(e.target.value)) return;
                  setEmptyManualTrade(prev => ({
                    ...prev,
                    fee: e.target.value,
                  })
                  )
                }}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            {isEditing ? (
              <div className={`${styles.btnRow} ${styles.submitBtn}`}>
                <button
                  className={styles.btnPrimary}
                  disabled={emptyManualTrade.side === "" || emptyManualTrade.typ === "" || emptyManualTrade.tim === ""}
                  ref={editBtnRef}
                  onClick={() => {
                    setManualTrades(prev =>
                      prev.map(t =>
                        t.id === editingManualTradeId ? {
                          id: editingManualTradeId,
                          side: emptyManualTrade.side,
                          typ: emptyManualTrade.typ,
                          tim: emptyManualTrade.tim,
                          qty: emptyManualTrade.qty === "" ? "0" : emptyManualTrade.qty,
                          jpy: emptyManualTrade.jpy === "" ? "0" : emptyManualTrade.jpy,
                          fee: emptyManualTrade.fee === "" ? "0" : emptyManualTrade.fee,
                        } : t
                      ));
                    setEmptyManualTrade({
                      id: crypto.randomUUID(),
                      side: "",
                      typ: "",
                      tim: "",
                      qty: "",
                      jpy: "",
                      fee: "",
                    })
                    setEditingManualTradeId("")
                    setIsEditing(false)
                  }}>
                  更新
                </button>
                <button
                  className={styles.btnGhost}
                  onClick={() => {
                    setEmptyManualTrade({
                      id: crypto.randomUUID(),
                      side: "",
                      typ: "",
                      tim: "",
                      qty: "",
                      jpy: "",
                      fee: "",
                    })
                    setEditingManualTradeId("")
                    setIsEditing(false)
                  }}>
                  キャンセル
                </button>
              </div>

            ) : (
              <button
                disabled={emptyManualTrade.side === "" || emptyManualTrade.typ === "" || emptyManualTrade.tim === ""}
                ref={submitBtnRef}
                className={`${styles.btnPrimary} ${styles.submitBtn}`}
                onClick={() => {
                  setManualTrades((prev) => {
                    return [...prev, {
                      id: emptyManualTrade.id,
                      side: emptyManualTrade.side,
                      typ: emptyManualTrade.typ,
                      tim: emptyManualTrade.tim,
                      qty: emptyManualTrade.qty === "" ? "0" : emptyManualTrade.qty,
                      jpy: emptyManualTrade.jpy === "" ? "0" : emptyManualTrade.jpy,
                      fee: emptyManualTrade.fee === "" ? "0" : emptyManualTrade.fee,
                    }];
                  });
                  setEmptyManualTrade({
                    id: crypto.randomUUID(),
                    side: "",
                    typ: "",
                    tim: "",
                    qty: "",
                    jpy: "",
                    fee: "",
                  })
                  setSbError(false)
                  setStep(3)
                }}>
                確定
              </button>
            )}
          </div>
        </div>



        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>入力した取引の一覧</div>

            <button
              className={styles.btnDanger}
              onClick={() => {
                const ok = window.confirm(
                  "すべての取引データを削除します。\nこの操作は元に戻せません。よろしいですか？"
                );

                if (!ok) return;
                setMResult("")
                setManualTrades([]);
                localStorage.removeItem("manualTrades");
              }}
            >
              すべて削除
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>取引日</th>
                  <th>取引種類</th>
                  <th>取引数量</th>
                  <th>取引金額</th>
                  <th>手数料</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {[...manualTrades]
                  .sort((a, b) => new Date(a.tim).getTime() - new Date(b.tim).getTime())
                  .map((trade) => (
                    <tr
                      key={trade.id}
                      className={trade.id === editingManualTradeId ? styles.editingRow : undefined}
                    >
                      <td>
                        {trade.tim}
                      </td>
                      <td>
                        {trade.side === "buy" ? "購入 (買い)" : "売却 (売り)"}
                      </td>
                      <td>
                        {trade.qty} {trade.typ}
                      </td>
                      <td>
                        {addComma(trade.jpy)} 円
                      </td>
                      <td>
                        {addComma(trade.fee)} 円
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.btnGhost}
                            onClick={() => {
                              setEmptyManualTrade({
                                id: trade.id,
                                side: trade.side,
                                typ: trade.typ,
                                tim: trade.tim,
                                qty: trade.qty,
                                jpy: trade.jpy,
                                fee: trade.fee,
                              })
                              setIsEditing(true);
                              setEditingManualTradeId(trade.id)
                            }
                            }
                          >
                            修正
                          </button>


                          <button

                            className={styles.btnGhost}
                            disabled={isEditing}
                            onClick={() => {
                              setManualTrades((prev) =>
                                prev.filter(t => t.id !== trade.id)
                              );
                            }}>
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className={styles.cardFooter}>
            <div className={styles.calcArea}>
              <label className={styles.calcLabel}>計算する年</label>
              <div className={styles.spinWrap}>


                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  value={targetYear}
                  onChange={(e) => {
                    const v = e.target.value;

                    // 空はOK（消せるようにする）
                    if (v === "") {
                      setTargetYear("");
                      return;
                    }

                    // 1〜9999 だけ許可（0始まり拒否）
                    if (!/^[1-9]\d{0,3}$/.test(v)) return;

                    setTargetYear(v);
                  }}
                />


              </div>


            </div>

            <button
              className={styles.btnPrimary}
              onClick={() => {
                setPushed(true)
                setError(false)
                tradeDict = {}
                years = []
                coins = []
                pnlTotal = 0
                setCanApply(false)
                for (const trade of manualTrades) {
                  if (trade.side === "buy" || trade.side === "sell") {
                    tradeDict[trade.typ] ??= {};
                    tradeDict[trade.typ][getYear(trade.tim)] ??= {};
                    tradeDict[trade.typ][getYear(trade.tim)][trade.side] ??= { qty: 0, jpy: 0, fee: 0 };

                    tradeDict[trade.typ][getYear(trade.tim)][trade.side]!.qty += Number(trade.qty);
                    tradeDict[trade.typ][getYear(trade.tim)][trade.side]!.jpy += Number(trade.jpy);
                    tradeDict[trade.typ][getYear(trade.tim)][trade.side]!.fee += Number(trade.fee);

                    if (!years.includes(getYear(trade.tim))) {
                      years.push(getYear(trade.tim));
                    }
                    if (!coins.includes(trade.typ)) {
                      coins.push(trade.typ);
                    }
                  }
                }

                // 年を昇順に（超重要）
                years.sort((a, b) => a - b);

                for (const coin of coins) {
                  // 期首（最初は 0 でOK。過去年分が入力されていれば、ループで育つ）
                  let startQty = 0;
                  let startCost = 0; // 取得原価（円）

                  for (const year of years) {
                    const buy = tradeDict[coin]?.[year]?.buy ?? { qty: 0, jpy: 0, fee: 0 };
                    const sell = tradeDict[coin]?.[year]?.sell ?? { qty: 0, jpy: 0, fee: 0 };

                    // その年の平均取得単価（総平均法：年内は一定）
                    const denom = startQty + buy.qty; // 期首保有量 + 購入量
                    const aveCost = denom === 0 ? 0 : (startCost + buy.jpy + buy.fee) / denom;

                    // その年の損益（targetYearだけ加算）
                    if (year === Number(targetYear)) {
                      pnlTotal += (sell.jpy - sell.fee) - aveCost * sell.qty;
                    }

                    // 年末を次年の期首へ（期末保有量と期末保有額）

                    const endQty = startQty + buy.qty - sell.qty;
                    if (endQty < -1e-12) { // 少数誤差対策でちょい余裕
                      setError(true);
                      return;
                    }
                    const endCost = aveCost * endQty;

                    startQty = endQty;
                    startCost = endCost;
                  }
                }


                const pnlValue = Math.round(pnlTotal);
                setPnlTotalState(pnlValue);

                const pnlText = `${pnlValue >= 0 ? "+" : "-"}${addComma(String(Math.abs(pnlValue)))}`;
                setMResult(pnlText)

                setMResult(pnlText)


                let salIncome = Number(salaryAmount || 0);
                let busIncome = Number(businessAmount || 0);
                let miscIncome = Number(otherMiscAmount || 0);

                totalIncome = salDed(salIncome)! + busIncome + miscIncome + pnlTotal

                if (isStudent === true &&
                  (salIncome > 0 || busIncome > 0) &&
                  totalIncome <= 850000 &&
                  (miscIncome + pnlTotal) < 100000
                ) {
                  stuIncomeTax = Math.max(progTax(basicDed(totalIncome)! - (busIncome - bizDed(busIncome)) - 270000)!, 0)
                  incomeTax = Math.max(progTax(basicDed(totalIncome)! - (busIncome - bizDed(busIncome)))!, 0)
                  if (stuIncomeTax < incomeTax) {
                    setCanApply(true)
                  }
                }
                else {
                  incomeTax = Math.max(progTax(basicDed(totalIncome)! - (busIncome - bizDed(busIncome)))!, 0)
                }

                const denom = totalIncome - (busIncome - bizDed(busIncome));
                qryptTax = denom === 0 ? 0 : Math.round(incomeTax * (pnlTotal / denom))
                setTax(qryptTax)

                setOtherIncome(busIncome + miscIncome + pnlTotal)
              }}
            >
              計算
            </button>

          </div>
        </div>

        {pushed === true &&
          <div className={styles.card}>
            <div className={styles.cardTitle}>計算結果</div>

            {error === true ? (
              <>
                {/* エラー専用の表示 */}
                <div className={styles.resultAlert}>
                  <div className={styles.resultAlertTitle}>このデータは計算できません</div>
                  <div className={styles.resultAlertText}>
                    売却数量が保有数量を上回っている可能性があります。<br />
                    取引の入力（過去年分を含む）を見直してください。
                  </div>
                </div>

                {/* ここから下は「計算不可」状態として薄く表示 */}
                <div className={styles.resultGrid}>
                  <div className={`${styles.resultBox} ${styles.resultBoxDisabled}`}>
                    <div className={styles.resultBoxTitleRow}>
                      <div className={styles.resultBoxTitle}>確定申告が必要な可能性</div>
                      <span className={`${styles.badge} ${styles.badgeDisabled}`}>—</span>
                    </div>
                    <div className={styles.resultDesc}>計算できないため判定できません。</div>
                  </div>

                  <div className={`${styles.resultBox} ${styles.resultBoxDisabled}`}>
                    <div className={styles.resultBoxTitle}>仮想通貨にかかる税金（概算）</div>
                    <div className={styles.resultValue}>— 円</div>
                    <div className={styles.resultNote}>計算できないため表示できません。</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 正常時 */}
                <div className={styles.resultWide}>
                  <div className={styles.resultBoxTitle}>損益合計</div>

                  {/* mResult が "+1,234" みたいになってる前提 */}
                  <div
                    className={[
                      styles.resultValue,
                      mResult.startsWith("+") ? styles.valuePlus : styles.valueMinus,
                    ].join(" ")}
                  >
                    {mResult} 円
                  </div>
                </div>

                <div className={styles.resultGrid}>
                  <div className={styles.resultBox}>
                    <div className={styles.resultBoxTitleRow}>
                      <div className={styles.resultBoxTitle}>確定申告が必要な可能性</div>
                      <span
                        className={[
                          styles.badge,
                          otherIncome < 140000
                            ? styles.badgeLow
                            : otherIncome <= 170000
                              ? styles.badgeMid
                              : styles.badgeHigh,
                        ].join(" ")}
                      >
                        {otherIncome < 140000 ? "小" : otherIncome <= 170000 ? "中" : "大"}
                      </span>
                    </div>

                    <div className={styles.resultDesc}>
                      条件によっては確定申告が必要になる場合があります。<br />
                      以下の項目をもとに判定しています。
                    </div>

                    <ul className={styles.resultList}>
                      <li>暗号資産の所得：{addComma(String(Math.round(pnlTotal)))} 円</li>
                      <li>給与収入：{addComma(String(Number(salaryAmount || 0)))} 円</li>
                      <li>事業所得：{addComma(String(Number(businessAmount || 0)))} 円</li>
                      <li>暗号資産以外の雑所得：{addComma(String(Number(otherMiscAmount || 0)))} 円</li>
                    </ul>
                  </div>

                  <div className={styles.resultBox}>
                    <div className={styles.resultBoxTitle}>仮想通貨にかかる税金（概算）</div>
                    <div className={styles.resultValue}>{addComma(String(tax))} 円</div>
                    <div className={styles.resultNote}>住民税などは別途考慮が必要です。</div>
                  </div>
                </div>

                <div className={styles.disclaimer}>
                  ※ 本サイトは、確定申告の要否や税額について法的助言・最終判断を提供するものではありません。<br />
                  入力内容にもとづく概算結果です。最終的には税理士・税務署等にご確認ください。<br />
                  ※ 入力漏れ・過去年分の未入力・取引所の手数料/履歴差異などにより、結果が実際と異なる場合があります。
                </div>
              </>
            )}


          </div>
        }


      </div>
    </div>


  );
}