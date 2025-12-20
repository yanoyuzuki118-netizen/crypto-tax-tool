"use client";

import { Butterfly_Kids, Elsie, Margarine } from "next/font/google";
import { useState, useRef, type RefObject, type KeyboardEvent } from "react";


export default function Page() {

  //型の定義
  type ManualTrade = {
    id: string;
    side: "buy" | "sell" | "";
    typ: string;
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
  type QJF = {
    qty: number;
    jpy: number;
    fee: number;
  }
  type QJ = {
    qty: number;
    jpy: number;
  }
  type tradeDict = Record<
    string,
    Partial<Record<Side, QJF>>
  >;

  type openDict = {
    [coin: string]: {}
  }
  type Side = "buy" | "sell";





  //stateの定義
  const [manualTrades, setManualTrades] = useState<ManualTrade[]>([]);
  const [emptyManualTrade, setEmptyManualTrade] = useState<ManualTrade>({
    id: crypto.randomUUID(),
    side: "",
    typ: "",
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
  const [step, setStep] = useState<number>(2);
  const [mResult, setMResult] = useState("")
  const [zeroError, setZeroError] = useState<Boolean>(false)



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

  //変数
  const OTHER = "__OTHER__";
  const sideRef = useRef<HTMLSelectElement>(null!);
  const typRef = useRef<HTMLSelectElement>(null!);
  const qtyRef = useRef<HTMLInputElement>(null!);
  const jpyRef = useRef<HTMLInputElement>(null!);
  const feeRef = useRef<HTMLInputElement>(null!);
  const submitBtnRef = useRef<HTMLButtonElement>(null!);
  const editBtnRef = useRef<HTMLButtonElement>(null!);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const createEmptyCategory = (): category => ({
    id: crypto.randomUUID(),
    name: "",
    qty: "",
    jpy: "",
  });
  const COIN_OPTIONS = ["BTC", "ETH", "XRP", "SOL", "LTC", "BCH", "MATIC"] as const;
  const tradeTypOptions = Array.from(
    new Set(
      openInfo
        .map((x) => x.name)
        .filter((n) => n !== "" && n !== OTHER)
    )
  );
  let smy: tradeDict = {}
  let pnlTotal = 0
  let coinCategory: string[] = [];
  let opendict: Record<string, QJ> = {};


  return (

    <div style={{ margin: "40px 20px" }}>

      <div /*マニュアル入力*/>

        {(step === 2 || step === 3) &&
          <div style={{ /*仮想通貨の選択*/
            padding: "16px 8px",
            border: "1px solid blue",
          }}>
            <div style={{ fontSize: "24px" }}>仮想通貨の選択</div>

            {openInfo.map((item) => {
              const used = new Set(
                openInfo
                  .filter((x) => x.id !== item.id)
                  .map((x) => x.name)
                  .filter((n) => n !== "" && n !== OTHER)
              );

              return (
                <div key={item.id} style={{ marginTop: "20px" }}>
                  <div
                    key={item.id}
                    style={{ marginTop: "20px" }}
                  >
                    <div style={{ display: "flex" }}>
                      <div>種類</div>



                      <select
                        style={{ border: "1px solid #ccc" }}
                        value={isOtherMap[item.id] ? OTHER : item.name}
                        onChange={(e) => {
                          const v = e.target.value;

                          setOpenInfo((prev) =>
                            prev.map((r) => (r.id === item.id ? { ...r, name: v } : r))
                          );

                          setIsOtherMap((prev) => ({
                            ...prev,
                            [item.id]: v === OTHER,
                          }));

                          if (v !== OTHER) {
                            setOtherNames((prev) => {
                              const next = { ...prev };
                              delete next[item.id];
                              return next;
                            });
                          }
                        }}


                      >
                        <option value="" disabled>選択してください</option>

                        {COIN_OPTIONS
                          .filter((coin) => !used.has(coin) || coin === item.name)
                          .map((coin) => (
                            <option key={coin} value={coin}>
                              {coin}
                            </option>
                          ))}

                        <option value={OTHER}>その他</option>
                      </select>


                    </div>
                    {isOtherMap[item.id] && (
                      <div style={{ display: "flex" }}>
                        <div>名前</div>
                        <input
                          style={{ border: "1px solid #ccc" }}
                          placeholder="通貨名を入力"
                          value={otherNames[item.id] ?? ""}
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase();

                            // 英字のみ（入力中は長さ制限ゆるくしておくと便利）
                            if (!/^[A-Z]*$/.test(v)) return;
                            if (v.length > 5) return;

                            // 重複チェック（openInfo.name に "実コード" が入っている前提でチェック）
                            const duplicated = openInfo.some(
                              (i) => i.id !== item.id && i.name === v
                            );
                            if (duplicated) {
                              setDuplicateError("すでに追加されています");
                              return;
                            }
                            setDuplicateError(null);

                            // 表示用
                            setOtherNames((prev) => ({
                              ...prev,
                              [item.id]: v,
                            }));

                            // ★計算用：openInfo.name も更新してしまう
                            setOpenInfo((prev) =>
                              prev.map((r) => (r.id === item.id ? { ...r, name: v } : r))
                            );
                          }}


                        />
                        <div style={{ color: "red" }}>{duplicateError}</div>
                      </div>
                    )}

                    <div style={{ display: "flex" }}>
                      <div>年初保有数量</div>
                      <input
                        style={{ border: "1px solid #ccc" }}
                        value={item.qty}
                        onChange={(e) => {
                          if (!/^(?:0|[1-9]\d*)(?:\.\d*)?$/.test(e.target.value) && e.target.value !== "") return;
                          const v = e.target.value
                          setOpenInfo((prev) =>
                            prev.map((r) =>

                              r.id === item.id
                                ? { ...r, qty: v }
                                : r
                            )
                          );
                        }
                        }
                      />
                    </div>
                    <div style={{ display: "flex" }}>
                      <div>年初保有額</div>
                      <input
                        style={{ border: "1px solid #ccc" }}
                        value={item.jpy}
                        onChange={(e) => {
                          if (!/^(|0|[1-9][0-9]*)$/.test(e.target.value) && e.target.value !== "") return;
                          const v = e.target.value
                          setOpenInfo((prev) =>
                            prev.map((r) =>
                              r.id === item.id ? { ...r, jpy: v } : r
                            )
                          );
                        }
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div style={{ display: "flex" }}>
              <button
                disabled={openInfo.at(-1)?.name === ""}
                style={{ border: "1px solid #ccc" }}
                onClick={() => {
                  setOpenInfo((prev) => [...prev, createEmptyCategory()]);
                }}
              >
                ＋
              </button>
              <button style={{ border: "1px solid #ccc" }}
                onClick={() => {
                  setOpenInfo((prev) => {
                    if (prev.length <= 1) return prev; // 1行は残す

                    const removed = prev[prev.length - 1]; // 消す要素
                    // otherNames 側も消して整合を取る
                    setOtherNames((namesPrev) => {
                      const next = { ...namesPrev };
                      delete next[removed.id];
                      return next;
                    });

                    return prev.slice(0, -1);
                  });

                  setDuplicateError(null);
                }}
              >
                －
              </button>
            </div>
            <button
              style={{ border: "1px solid #ccc", marginTop: "20px", }}
              onClick={() => setStep(3)}
              disabled={openInfo.at(-1)?.name === ""}
            >
              入力完了
            </button>
          </div>
        }

        {(step === 3 || step === 4) &&
          <div style={{ /*取引情報入力部分*/
            padding: "16px 8px",
            border: "1px solid blue",
          }}>
            {isEditing === false ?
              (<div style={{ fontSize: "24px" }}>取引情報の入力</div>) :
              (<div style={{ fontSize: "24px" }}>修正中</div>)
            }
            <div style={{ display: "flex" }}>
              <div>取引の種類</div>
              <select
                ref={sideRef}
                style={{ border: "1px solid #ccc" }}
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
              {sbError === true && <div style={{ color: "red" }}>入力してください</div>}

            </div>

            <div style={{ display: "flex" }}>
              <div>通貨</div>
              <select
                ref={typRef}
                style={{ border: "1px solid #ccc" }}
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

                {tradeTypOptions.map((coin) => (
                  <option key={coin} value={coin}>
                    {coin}
                  </option>
                ))}
              </select>
            </div>


            <div style={{ display: "flex" }}>
              <div>取引数量</div>
              <input
                ref={qtyRef}
                onKeyDown={handleEnterMove(jpyRef)}
                style={{ border: "1px solid #ccc" }}
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
            <div style={{ display: "flex" }}>
              <div>取引金額</div>
              <input
                ref={jpyRef}
                onKeyDown={handleEnterMove(feeRef)}
                style={{ border: "1px solid #ccc" }}
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
            <div style={{ display: "flex" }}>
              <div>手数料</div>
              <input
                ref={feeRef}
                onKeyDown={handleEnterMove(
                  isEditing ? editBtnRef : submitBtnRef
                )}
                style={{ border: "1px solid #ccc" }}
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
            {isEditing ? (
              <div>
                <button
                  ref={editBtnRef}
                  style={{ border: "1px solid #ccc" }}
                  onClick={() => {
                    setManualTrades(prev =>
                      prev.map(t =>
                        t.id === editingManualTradeId ? {
                          id: editingManualTradeId,
                          side: emptyManualTrade.side,
                          typ: emptyManualTrade.typ,
                          qty: emptyManualTrade.qty === "" ? "0" : emptyManualTrade.qty,
                          jpy: emptyManualTrade.jpy === "" ? "0" : emptyManualTrade.jpy,
                          fee: emptyManualTrade.fee === "" ? "0" : emptyManualTrade.fee,
                        } : t
                      ));
                    setEmptyManualTrade({
                      id: crypto.randomUUID(),
                      side: "",
                      typ: "",
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
                  style={{ border: "1px solid #ccc" }}
                  onClick={() => {
                    setEmptyManualTrade({
                      id: crypto.randomUUID(),
                      side: "",
                      typ: "",
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
                disabled={emptyManualTrade.side === "" || emptyManualTrade.typ === ""}
                ref={submitBtnRef}
                style={{ border: "1px solid #ccc" }}
                onClick={() => {
                  setManualTrades((prev) => {
                    return [...prev, {
                      id: emptyManualTrade.id,
                      side: emptyManualTrade.side,
                      typ: emptyManualTrade.typ,
                      qty: emptyManualTrade.qty === "" ? "0" : emptyManualTrade.qty,
                      jpy: emptyManualTrade.jpy === "" ? "0" : emptyManualTrade.jpy,
                      fee: emptyManualTrade.fee === "" ? "0" : emptyManualTrade.fee,
                    }];
                  });
                  setEmptyManualTrade({
                    id: crypto.randomUUID(),
                    side: "",
                    typ: "",
                    qty: "",
                    jpy: "",
                    fee: "",
                  })
                  setSbError(false)
                  setTimeout(() => sideRef.current?.focus(), 0);
                }}>
                確定
              </button>
            )}

          </div>
        }

        {(step === 3 || step === 4) &&
          <div style={{ /*取引情報出力部分*/
            padding: "16px 8px",
            border: "1px solid blue",
          }}>
            <div style={{ fontSize: "24px" }}>取引情報の出力</div>
            <table>
              <thead>
                <tr>
                  <th style={{ border: "1px solid black", padding: "10px" }}>取引種類</th>
                  <th style={{ border: "1px solid black", padding: "10px" }}>取引数量</th>
                  <th style={{ border: "1px solid black", padding: "10px" }}>取引金額</th>
                  <th style={{ border: "1px solid black", padding: "10px" }}>手数料</th>
                  <th style={{ border: "1px solid black", padding: "10px" }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {manualTrades.map((trade) => (
                  <tr key={trade.id}>
                    <td style={{ border: "1px solid black", padding: "6px", textAlign: "left" }}>
                      {trade.side === "buy" ? "購入 (買い)" : "売却 (売り)"}
                    </td>
                    <td style={{ border: "1px solid black", padding: "6px", textAlign: "right" }}>
                      {trade.qty} {trade.typ}
                    </td>
                    <td style={{ border: "1px solid black", padding: "6px", textAlign: "right" }}>
                      {addComma(trade.jpy)} 円
                    </td>
                    <td style={{ border: "1px solid black", padding: "6px", textAlign: "right" }}>
                      {addComma(trade.fee)} 円
                    </td>
                    <td style={{ border: "1px solid black", padding: "6px", textAlign: "right" }}>

                      <button
                        style={{ border: "1px solid #ccc" }}
                        onClick={() => {
                          setEmptyManualTrade({
                            id: trade.id,
                            side: trade.side,
                            typ: trade.typ,
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

                        style={{ border: "1px solid #ccc" }}
                        disabled={isEditing}
                        onClick={() => {
                          setManualTrades((prev) =>
                            prev.filter(t => t.id !== trade.id)
                          );
                        }}>
                        削除
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              style={{ border: "1px solid #ccc", marginTop: "20px" }}
              onClick={() => {
                smy = {};
                coinCategory = []
                setZeroError(false)
                manualTrades.forEach((trade) => {
                  // typ が空ならスキップ（念のため）
                  if (!trade.typ) return;

                  // side が buy/sell 以外（つまり ""）ならスキップ
                  if (trade.side !== "buy" && trade.side !== "sell") return;
                  const side: Side = trade.side;

                  // coinCategory 追加（重複しないように）
                  if (!coinCategory.includes(trade.typ)) {
                    coinCategory.push(trade.typ);
                  }

                  // coin の箱を作る（Partial<Record<Side, QJF>>）
                  smy[trade.typ] ??= {};

                  // buy/sell の箱を作る（QJF）
                  smy[trade.typ][side] ??= { qty: 0, jpy: 0, fee: 0 };

                  // ここから加算（??= したので ! でOK）
                  smy[trade.typ][side]!.qty += num(trade.qty);
                  smy[trade.typ][side]!.jpy += num(trade.jpy);
                  smy[trade.typ][side]!.fee += num(trade.fee);
                });
                opendict = {};
                openInfo.forEach((info) => {
                  if (!info.name) return;
                  opendict[info.name] = { qty: num(info.qty), jpy: num(info.jpy) };
                });
                pnlTotal = 0
                for (const trade of coinCategory) {
                  const buy = smy[trade]?.buy ?? { qty: 0, jpy: 0, fee: 0 };
                  const sell = smy[trade]?.sell ?? { qty: 0, jpy: 0, fee: 0 };
                  const open = opendict[trade] ?? { qty: 0, jpy: 0 };

                  const aveCost_num =
                    open.jpy + buy.jpy + buy.fee;

                  const aveCost_denom =
                    open.qty + buy.qty;
                  if (aveCost_denom === 0) {
                    setZeroError(true)
                    break
                  }
                  const pnl =
                    sell.jpy -
                    ((aveCost_num / aveCost_denom) * sell.qty + sell.fee);

                  pnlTotal += pnl;
                }

                setMResult(addComma(String(Math.round(pnlTotal))));
                setStep(4);
              }}
            >
              計算
            </button>
          </div>

        }
        {(step === 4) &&
          <div style={{ border: "1px solid blue" }}>
            <div style={{ fontSize: "24px" }}>計算結果</div>
            {zeroError === false &&

              <div style={{ display: "flex" }}>
                <div>損益合計</div>
                <div>{mResult}円</div>
              </div>
            }
            {zeroError === true &&
              <div>このデータは計算できません</div>
            }
          </div>
        }
      </div>

    </div >

  );
}