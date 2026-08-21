"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  analyzePassword,
  generatePassword,
  generatePhrase,
  makeHistory,
  type HistoryItem,
  type PasswordOptions,
} from "@/lib/passgen";
import {
  Activity,
  AlertCircle,
  Archive,
  Check,
  CheckCircle2,
  Clipboard,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  FileKey2,
  GitFork,
  Hash,
  KeyRound,
  LockKeyhole,
  Moon,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  WandSparkles,
  Zap,
} from "lucide-react";

type PageKey = "generator" | "phrases" | "checker" | "history" | "settings";
const nav = [
  { key: "generator", label: "Генератор", icon: KeyRound },
  { key: "phrases", label: "Парольные фразы", icon: WandSparkles },
  { key: "checker", label: "Проверка пароля", icon: ShieldCheck },
  { key: "history", label: "Сохраненные", icon: Archive },
  { key: "settings", label: "Настройки", icon: Settings },
] as const;
const defaultOptions: PasswordOptions = {
  length: 24,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: true,
};

function copyText(value: string) {
  if (!value) return;
  void navigator.clipboard?.writeText(value).catch(() => {});
}
function downloadBackup(data: object) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `passgen-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`toggle ${checked ? "active" : ""}`}
    >
      <span />
      {label}
    </button>
  );
}
function Strength({
  score,
  label,
  entropy,
}: {
  score: number;
  label: string;
  entropy: number;
}) {
  return (
    <div className="strength">
      <div className="strength-top">
        <span>Сложность</span>
        <strong>{label}</strong>
      </div>
      <div className="bars">
        {[0, 1, 2, 3, 4].map((i) => (
          <i className={i <= score ? `fill-${score}` : ""} key={i} />
        ))}
      </div>
      <div className="strength-bottom">
        <span>Энтропия</span>
        <strong>{entropy} бит</strong>
      </div>
    </div>
  );
}

function GeneratorPage({
  options,
  setOptions,
  onSave,
  announce,
}: {
  options: PasswordOptions;
  setOptions: (o: PasswordOptions) => void;
  onSave: (v: string) => void;
  announce: (v: string) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const score = useMemo(() => analyzePassword(value), [value]);
  const create = () => {
    try {
      const next = generatePassword(options);
      setValue(next);
      setError("");
      announce("Новый пароль создан");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать пароль");
    }
  };
  const save = () => {
    if (!value) return;
    onSave(value);
    announce("Пароль сохранён в историю");
  };
  return (
    <section className="page-section">
      <div className="eyebrow">
        <span className="eyebrow-icon">
          <Sparkles size={16} />
        </span>
        <span>ГЕНЕРАТОР</span>
      </div>
      <h1>
        Создайте пароль,
        <br />
        <em>который защитит вашу учетную запись</em>
      </h1>
      <p className="lead">
        Криптографически безопасный генератор паролей и парольных фраз.
      </p>
      <div className="generator-layout">
        <div className="password-card">
          <div className="password-card-top">
            <span>ВАШ НОВЫЙ ПАРОЛЬ</span>
            <span className="secure">
            <LockKeyhole size={13} /> Данные защищены
            </span>
          </div>
          <div className="password-value" aria-live="polite">
            {value || "Создать пароль"}
          </div>
          <div className="password-actions">
            <button type="button" className="button primary" onClick={create}>
              <RotateCcw size={17} /> Сгенерировать
            </button>
            <button type="button" className="button secondary" onClick={save} disabled={!value}>
              <Archive size={17} /> Сохранить
            </button>
            <button
              type="button"
              className="button icon-button"
              aria-label="Копировать пароль"
              onClick={() => {
                copyText(value);
                announce("Пароль скопирован");
              }}
            >
              <Copy size={18} />
            </button>
          </div>
        </div>
        <Strength
          score={score.score}
          label={score.label}
          entropy={score.entropy}
        />
      </div>
      <div className="settings-card">
        <div className="settings-head">
          <div>
            <h2>Настройка генерации</h2>
            <p>Настройте пароль под свои требования</p>
          </div>
        </div>
        <div className="length-row">
          <label htmlFor="length">Длина пароля</label>
          <output>{options.length}</output>
        </div>
        <input
          id="length"
          className="range"
          type="range"
          min="4"
          max="128"
          value={options.length}
          onChange={(e) =>
            setOptions({ ...options, length: Number(e.target.value) })
          }
        />
        <div className="range-labels">
          <span>4</span>
          <span>128</span>
        </div>
        <div className="option-grid">
          <Toggle
            checked={options.uppercase}
            onChange={(v) => setOptions({ ...options, uppercase: v })}
            label="Заглавные A–Z"
          />
          <Toggle
            checked={options.lowercase}
            onChange={(v) => setOptions({ ...options, lowercase: v })}
            label="Строчные a–z"
          />
          <Toggle
            checked={options.numbers}
            onChange={(v) => setOptions({ ...options, numbers: v })}
            label="Цифры 0–9"
          />
          <Toggle
            checked={options.symbols}
            onChange={(v) => setOptions({ ...options, symbols: v })}
            label="Спецсимволы"
          />
        </div>
        <div className="divider" />
        <Toggle
          checked={options.excludeAmbiguous}
          onChange={(v) => setOptions({ ...options, excludeAmbiguous: v })}
          label="Исключить неоднозначные символы"
        />
      </div>
      <div className="tip-card">
        <div className="tip-icon">
          <ShieldCheck size={19} />
        </div>
        <div>
          <strong>Совет по безопасности</strong>
          <p>
            Используйте уникальный пароль для каждого сервиса. Никогда не
            отправляйте его в сообщениях.
          </p>
        </div>
      </div>
      {error && (
        <div className="error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}
    </section>
  );
}

function PhrasesPage({
  onSave,
  announce,
}: {
  onSave: (v: string) => void;
  announce: (v: string) => void;
}) {
  const [words, setWords] = useState(4);
  const [separator, setSeparator] = useState("-");
  const [numbers, setNumbers] = useState(true);
  const [symbol, setSymbol] = useState(true);
  const [capital, setCapital] = useState(true);
  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(generatePhrase(words, separator, numbers, symbol, capital));
  }, []);
  const create = () => {
    const next = generatePhrase(words, separator, numbers, symbol, capital);
    setValue(next);
    announce("Фраза создана");
  };
  const save = () => {
    if (!value) return;
    onSave(value);
    announce("Фраза сохранена в историю");
  };
  return (
    <section className="page-section">
      <div className="eyebrow">
        <span className="eyebrow-icon">
          <WandSparkles size={16} />
        </span>
        <span>ПАРОЛЬНЫЕ ФРАЗЫ</span>
      </div>
      <h1>
        Запоминается легко,
        <br />
        <em>взламывается сложно</em>
      </h1>
      <p className="lead">
        Надёжные комбинации слов, созданные для удобного запоминания и высокой безопасности.
      </p>
      <div className="phrase-card">
        <div className="password-card-top">
          <span>ВАША ПАРОЛЬНАЯ ФРАЗА</span>
          <span className="secure">
            <LockKeyhole size={13} /> Данные защищены
          </span>
        </div>
        <div className="password-value phrase-value">{value}</div>
        <div className="password-actions">
          <button type="button" className="button primary" onClick={create}>
            <RotateCcw size={17} /> Создать фразу
          </button>
          <button type="button" className="button secondary" onClick={save} disabled={!value}>
            <Archive size={17} /> Сохранить
          </button>
          <button
            type="button"
            className="button icon-button"
            onClick={() => {
              copyText(value);
              announce("Фраза скопирована");
            }}
          >
            <Copy size={18} />
          </button>
        </div>
      </div>
      <div className="settings-card phrase-settings">
        <div className="settings-head">
          <div>
            <h2>Настройки фразы</h2>
            <p>Сбалансируйте удобство и защиту</p>
          </div>
        </div>
        <div className="inline-fields">
          <label>
            Количество слов
            <select
              value={words}
              onChange={(e) => setWords(Number(e.target.value))}
            >
              {[3, 4, 5, 6].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Разделитель
            <input
              value={separator}
              maxLength={2}
              onChange={(e) => setSeparator(e.target.value)}
            />
          </label>
        </div>
        <div className="option-grid">
          <Toggle
            checked={numbers}
            onChange={setNumbers}
            label="Добавлять цифры"
          />
          <Toggle
            checked={symbol}
            onChange={setSymbol}
            label="Добавлять символ"
          />
          <Toggle
            checked={capital}
            onChange={setCapital}
            label="Заглавные буквы"
          />
        </div>
      </div>
    </section>
  );
}

function CheckerPage() {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const result = analyzePassword(value);
  return (
    <section className="page-section">
      <div className="eyebrow">
        <span className="eyebrow-icon">
          <ShieldCheck size={16} />
        </span>
        <span>ПРОВЕРКА ПАРОЛЯ</span>
      </div>
      <h1>
        Узнайте, насколько
        <br />
        <em>надёжен ваш пароль</em>
      </h1>
      <p className="lead">
        Проверка пароля на основе длины, разнообразия символов и энтропии.
      </p>
      <div className="checker-grid">
        <div className="settings-card">
          <div className="settings-head">
            <div>
              <h2>Введите пароль</h2>
              <p>Он не будет сохранён в истории</p>
            </div>
            <LockKeyhole size={18} />
          </div>
          <div className="password-input">
            <input
              aria-label="Пароль для проверки"
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Введите пароль для проверки"
            />
            <button
              onClick={() => setShow(!show)}
              aria-label={show ? "Скрыть пароль" : "Показать пароль"}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="check-list">
            {[
              ["Строчные буквы", result.categories[0]],
              ["Заглавные буквы", result.categories[1]],
              ["Цифры", result.categories[2]],
              ["Спецсимволы", result.categories[3]],
            ].map(([label, yes]) => (
              <div key={String(label)}>
                <span className={yes ? "check yes" : "check"}>
                  {yes ? <Check size={13} /> : ""}
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="result-card">
          <div className="result-score">
            <div className={`score-circle score-${result.score}`}>
              <strong>{result.entropy}</strong>
              <span>бит</span>
            </div>
            <div>
              <span className="muted">ИТОГОВАЯ ОЦЕНКА</span>
              <h2>{value ? result.label : "Ожидание проверки"}</h2>
            </div>
          </div>
          <div className="recommendations">
            <strong>
              <Zap size={15} /> Рекомендации
            </strong>
            {result.tips.map((tip) => (
              <p key={tip}>
                <CheckCircle2 size={15} />
                {tip}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HistoryPage({
  history,
  setHistory,
  announce,
}: {
  history: HistoryItem[];
  setHistory: (v: HistoryItem[]) => void;
  announce: (v: string) => void;
}) {
  return (
    <section className="page-section">
      <div className="eyebrow">
        <span className="eyebrow-icon">
          <Archive size={16} />
        </span>
        <span>СОХРАНЕННЫЕ</span>
      </div>
      <div className="title-row">
        <div>
          <h1>Ваши генерации</h1>
          <p className="lead">Пароли, созданные на этом устройстве.</p>
        </div>
        {history.length > 0 && (
          <button
            className="button ghost danger"
            onClick={() => {
              if (confirm("Очистить всю историю?")) {
                setHistory([]);
                announce("Сохраненные очищены");
              }
            }}
          >
            <Trash2 size={16} /> Очистить всё
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <div className="empty">
          <Archive size={32} />
          <h2>Сохраненных пока нет</h2>
          <p>
            Созданные пароли будут сохранены здесь.
          </p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div className="history-item" key={item.id}>
              <div className="history-mark">
                <KeyRound size={17} />
              </div>
              <div className="history-main">
                <strong>{item.value}</strong>
                <span>
                  {item.type} ·{" "}
                  {new Date(item.createdAt).toLocaleString("ru-RU")}
                </span>
              </div>
              <button
                aria-label="Копировать"
                onClick={() => {
                  copyText(item.value);
                  announce("Скопировано");
                }}
              >
                <Copy size={17} />
              </button>
              <button
                aria-label="Удалить"
                onClick={() =>
                  setHistory(history.filter((entry) => entry.id !== item.id))
                }
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SettingsPage({
  saveHistory,
  setSaveHistory,
  theme,
  setTheme,
  options,
  setOptions,
  history,
  setHistory,
  onExport,
  onImport,
}: any) {
  const fileInput = useRef<HTMLInputElement>(null);
  return (
    <section className="page-section">
      <div className="eyebrow">
        <span className="eyebrow-icon">
          <Settings size={16} />
        </span>
        <span>НАСТРОЙКИ</span>
      </div>
      <h1>
        Настройте PassGen
        <br />
        <em>под себя</em>
      </h1>
      <p className="lead">
        Ваши предпочтения и история сохраняются локально в браузере. Вы можете экспортировать их в файл для резервного копирования.
      </p>
      <div className="settings-card pref-card">
        <div className="setting-line">
          <div>
            <h2>Тема интерфейса</h2>
            <p>Выберите комфортный режим</p>
          </div>
          <div className="segmented">
            {[
              ["light", <Sun size={15} />],
              ["system", <Activity size={15} />],
              ["dark", <Moon size={15} />],
            ].map(([key, icon]) => (
              <button
                type="button"
                className={theme === key ? "selected" : ""}
                key={String(key)}
                onClick={() => setTheme(key)}
              >
                {icon}
                {key === "light"
                  ? "Светлая"
                  : key === "system"
                    ? "Системная"
                    : "Тёмная"}
              </button>
            ))}
          </div>
        </div>
        <div className="divider" />
        <div className="setting-line">
          <div>
            <h2>Сохранять историю</h2>
            <p>По умолчанию выключено для безопасности</p>
          </div>
          <Toggle
            checked={saveHistory}
            onChange={setSaveHistory}
            label={saveHistory ? "Включено" : "Выключено"}
          />
        </div>
        <div className="divider" />
        <div className="setting-line">
          <div>
            <h2>Длина по умолчанию</h2>
            <p>Для новых паролей</p>
          </div>
          <output className="number-output">{options.length}</output>
        </div>
        <input
          className="range"
          type="range"
          min="4"
          max="128"
          value={options.length}
          onChange={(e) =>
            setOptions({ ...options, length: Number(e.target.value) })
          }
        />
      </div>
      <div className="security-note">
        <ShieldCheck size={20} />
        <div>
          <strong>Приватность прежде всего</strong>
          <p>
            PassGen не использует серверы и не отправляет ваши данные в интернет. Все операции выполняются локально на вашем устройстве.
          </p>
        </div>
      </div>
      <div className="backup-actions">
        <button type="button" className="button ghost" onClick={onExport}>
          <FileKey2 size={16} /> Сохранить в файл
        </button>
        <button
          type="button"
          className="button ghost"
          onClick={() => fileInput.current?.click()}
        >
          <Archive size={16} /> Загрузить файл
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImport(file);
            e.target.value = "";
          }}
        />
      </div>
      <button
        type="button"
        className="button ghost danger"
        onClick={() => {
          if (confirm("Удалить локальную историю?")) setHistory([]);
        }}
      >
        <Trash2 size={16} /> Удалить историю
      </button>
    </section>
  );
}

export default function Page() {
  const [active, setActive] = useState<PageKey>("generator");
  const [options, setOptions] = useState<PasswordOptions>(defaultOptions);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [saveHistory, setSaveHistory] = useState(false);
  const [theme, setTheme] = useState(
    typeof document !== "undefined" && document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme
      : "light",
  );
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("passgen-settings");
      if (saved) {
        const data = JSON.parse(saved);
        setOptions({ ...defaultOptions, ...data.options });
        setSaveHistory(Boolean(data.saveHistory));
        setTheme(data.theme || "light");
        if (data.history) setHistory(data.history);
      }
    } catch {} finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        "passgen-settings",
        JSON.stringify({
          options,
          saveHistory,
          theme,
          history: saveHistory ? history : [],
        }),
      );
    } catch {
      /* Хранилище может быть недоступно в приватном режиме браузера. */
    }
  }, [loaded, options, saveHistory, theme, history]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        setActive("generator");
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActive("checker");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const navigate = (key: PageKey) => {
    setNotice("");
    setActive(key);
  };
  const announce = (text: string) => {
    setNotice(text);
    window.setTimeout(
      () => setNotice((current) => (current === text ? "" : current)),
      2200,
    );
  };
  const save = (value: string, type: HistoryItem["type"] = "Пароль") => {
    if (saveHistory)
      setHistory((current) =>
        [makeHistory(value, type), ...current].slice(0, 50),
      );
  };
  const exportBackup = () => {
    downloadBackup({
      version: 1,
      savedAt: new Date().toISOString(),
      options,
      saveHistory,
      theme,
      history,
    });
    announce("Файл сохранён");
  };
  const importBackup = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== "object" || !data.options)
        throw new Error("Неверный файл PassGen");
      setOptions({ ...defaultOptions, ...data.options });
      setSaveHistory(Boolean(data.saveHistory));
      setTheme(
        data.theme === "dark" || data.theme === "system" ? data.theme : "light",
      );
      setHistory(Array.isArray(data.history) ? data.history.slice(0, 50) : []);
      announce("Файл загружен");
    } catch (error) {
      announce(
        error instanceof Error ? error.message : "Не удалось загрузить файл",
      );
    }
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <KeyRound size={19} />
          </div>
          <span>PassGen</span>
        </div>
        <nav aria-label="Основная навигация">
          {nav.map(({ key, label, icon: Icon }) => (
            <button
              type="button"
              key={key}
              onClick={() => navigate(key)}
              className={active === key ? "nav-item active" : "nav-item"}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <span className="breadcrumb">
            PassGen <span>/</span>{" "}
            {nav.find((item) => item.key === active)?.label}
          </span>
          <div className="top-actions">
            <span className="top-actions-label">
          </span>
            <button
              type="button"
              className="mini-button"
              onClick={() => navigate("settings")}
              aria-label="Настройки"
            >
              <Settings size={17} />
            </button>
          </div>
        </header>
        <div className="content">
          {active === "generator" && (
            <GeneratorPage
              key={active}
              options={options}
              setOptions={setOptions}
              onSave={save}
              announce={announce}
            />
          )}
          {active === "phrases" && (
            <PhrasesPage
              key={active}
              onSave={(v) => save(v, "Фраза")}
              announce={announce}
            />
          )}
          {active === "checker" && <CheckerPage key={active} />}
          {active === "history" && (
            <HistoryPage
              key={active}
              history={history}
              setHistory={setHistory}
              announce={announce}
            />
          )}
          {active === "settings" && (
            <SettingsPage
              key={active}
              saveHistory={saveHistory}
              setSaveHistory={setSaveHistory}
              theme={theme}
              setTheme={setTheme}
              options={options}
              setOptions={setOptions}
              history={history}
              setHistory={setHistory}
              onExport={exportBackup}
              onImport={importBackup}
            />
          )}
        </div>
        <footer>
          <span>PassGen v1.0.0</span>
          <span>
            <span className="footer-dot" /> Данные защищены
          </span>
          <a
            className="github-link"
            href="https://github.com/Anyusek/PassGen"
            target="_blank"
            rel="noreferrer"
          >
            <GitFork size={14} /> GitHub
          </a>
        </footer>
      </main>
      {notice && (
        <div className="toast">
          <Check size={16} /> {notice}
        </div>
      )}
    </div>
  );
}
