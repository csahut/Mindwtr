import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { TaskEnergyLevel, TaskPriority, TaskStatus, TimeEstimate } from '@mindwtr/core';

import { cn } from '../../../lib/utils';
import { taskEditorLabelClassName } from '../task-editor-label';

type PillOption<TValue extends string> = {
    value: TValue;
    label: string;
};

const selectedPillClassName = 'border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90';

const canonicalToken = (value: string): string =>
    value.trim().replace(/^[@#]/, '').toLowerCase();

const splitTokens = (value: string): string[] =>
    value.split(',').map((item) => item.trim()).filter(Boolean);

const uniqueOptions = (options: string[]): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];
    options.forEach((option) => {
        const trimmed = option.trim();
        const key = canonicalToken(trimmed);
        if (!trimmed || seen.has(key)) return;
        seen.add(key);
        result.push(trimmed);
    });
    return result;
};

const matchesOption = (option: string, query: string): boolean => {
    const normalizedQuery = query.trim().toLowerCase();
    const bareQuery = canonicalToken(query);
    if (!normalizedQuery && !bareQuery) return false;
    const normalizedOption = option.trim().toLowerCase();
    const bareOption = canonicalToken(option);
    return normalizedOption.includes(normalizedQuery) || bareOption.includes(bareQuery);
};

const getCurrentTokenQuery = (value: string, cursor: number | null): string => {
    const index = typeof cursor === 'number' ? cursor : value.length;
    const beforeCursor = value.slice(0, index);
    const commaIndex = beforeCursor.lastIndexOf(',');
    return beforeCursor.slice(commaIndex + 1).trim();
};

const getTokensOutsideCurrentQuery = (value: string, cursor: number | null): string[] => {
    const index = typeof cursor === 'number' ? cursor : value.length;
    const beforeCursor = value.slice(0, index);
    const afterCursor = value.slice(index);
    const tokenStart = beforeCursor.lastIndexOf(',') + 1;
    const nextComma = afterCursor.indexOf(',');
    const tokenEnd = nextComma === -1 ? value.length : index + nextComma;
    return [
        ...splitTokens(value.slice(0, tokenStart)),
        ...splitTokens(value.slice(tokenEnd)),
    ];
};

const replaceCurrentToken = (value: string, cursor: number | null, token: string): string => {
    const index = typeof cursor === 'number' ? cursor : value.length;
    const beforeCursor = value.slice(0, index);
    const afterCursor = value.slice(index);
    const tokenStart = beforeCursor.lastIndexOf(',') + 1;
    const nextComma = afterCursor.indexOf(',');
    const tokenEnd = nextComma === -1 ? value.length : index + nextComma;
    const nextTokens = [
        ...splitTokens(value.slice(0, tokenStart)),
        token,
        ...splitTokens(value.slice(tokenEnd)),
    ];
    const seen = new Set<string>();
    return nextTokens
        .filter((item) => {
            const key = canonicalToken(item);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .join(', ');
};

function SuggestionList({
    activeIndex,
    suggestions,
    onSelect,
}: {
    activeIndex: number;
    suggestions: string[];
    onSelect: (value: string) => void;
}) {
    if (suggestions.length === 0) return null;
    return (
        <div
            role="listbox"
            className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
        >
            {suggestions.map((suggestion, index) => (
                <button
                    key={suggestion}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseDown={(event) => {
                        event.preventDefault();
                        onSelect(suggestion);
                    }}
                    className={cn(
                        'flex w-full items-center px-2.5 py-1.5 text-left text-xs transition-colors',
                        index === activeIndex
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted/70'
                    )}
                >
                    {suggestion}
                </button>
            ))}
        </div>
    );
}

function PillOptionField<TValue extends string>({
    ariaLabel,
    label,
    options,
    value,
    onChange,
    activeClassName,
}: {
    ariaLabel: string;
    label: string;
    options: Array<PillOption<TValue>>;
    value: TValue;
    onChange: (value: TValue) => void;
    activeClassName?: string;
}) {
    const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const focusOption = (index: number) => {
        buttonRefs.current[index]?.focus();
        onChange(options[index].value);
    };
    const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
            event.preventDefault();
            focusOption((index + 1) % options.length);
            return;
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
            event.preventDefault();
            focusOption((index - 1 + options.length) % options.length);
            return;
        }
        if (event.key === 'Home') {
            event.preventDefault();
            focusOption(0);
            return;
        }
        if (event.key === 'End') {
            event.preventDefault();
            focusOption(options.length - 1);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <label className={taskEditorLabelClassName}>{label}</label>
            <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
                {options.map((option, index) => {
                    const isActive = value === option.value;
                    return (
                        <button
                            key={option.value || 'none'}
                            ref={(element) => {
                                buttonRefs.current[index] = element;
                            }}
                            type="button"
                            aria-pressed={isActive}
                            onKeyDown={(event) => handleOptionKeyDown(event, index)}
                            onClick={() => onChange(option.value)}
                            className={cn(
                                'inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40',
                                isActive
                                    ? activeClassName ?? selectedPillClassName
                                    : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function ToggleTokenField({
    ariaLabel,
    label,
    options,
    suggestions = options,
    placeholder,
    value,
    onChange,
}: {
    ariaLabel: string;
    label: string;
    options: string[];
    suggestions?: string[];
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [focused, setFocused] = useState(false);
    const [cursor, setCursor] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const query = getCurrentTokenQuery(value, cursor);
    const currentTokens = useMemo(() => splitTokens(value), [value]);
    const otherTokenKeys = useMemo(
        () => new Set(getTokensOutsideCurrentQuery(value, cursor).map(canonicalToken)),
        [cursor, value]
    );
    const filteredSuggestions = useMemo(() => {
        if (!focused || !query) return [];
        const trimmedQuery = query.trim().toLowerCase();
        return uniqueOptions(suggestions)
            .filter((option) => matchesOption(option, query))
            .filter((option) => option.trim().toLowerCase() !== trimmedQuery)
            .filter((option) => !otherTokenKeys.has(canonicalToken(option)))
            .slice(0, 6);
    }, [focused, otherTokenKeys, query, suggestions]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    const selectSuggestion = (suggestion: string) => {
        onChange(replaceCurrentToken(value, cursor, suggestion));
        setCursor(null);
        setFocused(false);
        requestAnimationFrame(() => inputRef.current?.focus());
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (filteredSuggestions.length === 0) return;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % filteredSuggestions.length);
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => (index - 1 + filteredSuggestions.length) % filteredSuggestions.length);
            return;
        }
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            event.stopPropagation();
            selectSuggestion(filteredSuggestions[activeIndex] ?? filteredSuggestions[0]);
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setFocused(false);
        }
    };

    return (
        <div className="flex flex-col gap-1 w-full">
            <label className={taskEditorLabelClassName}>{label}</label>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    aria-label={ariaLabel}
                    aria-autocomplete="list"
                    aria-expanded={filteredSuggestions.length > 0}
                    value={value}
                    onChange={(event) => {
                        setCursor(event.currentTarget.selectionStart);
                        onChange(event.target.value);
                    }}
                    onClick={(event) => setCursor(event.currentTarget.selectionStart)}
                    onKeyUp={(event) => setCursor(event.currentTarget.selectionStart)}
                    onKeyDown={handleKeyDown}
                    onFocus={(event) => {
                        setFocused(true);
                        setCursor(event.currentTarget.selectionStart);
                    }}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    className="text-xs bg-muted/50 border border-border rounded px-2 py-1 w-full text-foreground placeholder:text-muted-foreground"
                />
                <SuggestionList
                    activeIndex={activeIndex}
                    suggestions={filteredSuggestions}
                    onSelect={selectSuggestion}
                />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
                {options.map((token) => {
                    const isActive = currentTokens.some((item) => canonicalToken(item) === canonicalToken(token));
                    return (
                        <button
                            key={token}
                            type="button"
                            onClick={() => {
                                const nextTokens = isActive
                                    ? currentTokens.filter((item) => canonicalToken(item) !== canonicalToken(token))
                                    : [...currentTokens, token];
                                onChange(nextTokens.join(', '));
                            }}
                            className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full border transition-colors',
                                isActive
                                    ? selectedPillClassName
                                    : 'bg-transparent border-border text-muted-foreground hover:border-primary/50'
                            )}
                        >
                            {token}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function AutocompleteTextField({
    ariaLabel,
    label,
    options,
    placeholder,
    value,
    onChange,
}: {
    ariaLabel: string;
    label: string;
    options: string[];
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [focused, setFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const query = value.trim();
    const suggestions = useMemo(() => {
        if (!focused || !query) return [];
        const queryKey = query.toLowerCase();
        return uniqueOptions(options)
            .filter((option) => option.toLowerCase().includes(queryKey))
            .filter((option) => option.toLowerCase() !== queryKey)
            .slice(0, 6);
    }, [focused, options, query]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    const selectSuggestion = (suggestion: string) => {
        onChange(suggestion);
        setFocused(false);
        requestAnimationFrame(() => inputRef.current?.focus());
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (suggestions.length === 0) return;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % suggestions.length);
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            selectSuggestion(suggestions[activeIndex] ?? suggestions[0]);
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setFocused(false);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <label className={taskEditorLabelClassName}>{label}</label>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    aria-label={ariaLabel}
                    aria-autocomplete="list"
                    aria-expanded={suggestions.length > 0}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    className="text-xs bg-muted/50 border border-border rounded px-2 py-1 w-full text-foreground"
                />
                <SuggestionList
                    activeIndex={activeIndex}
                    suggestions={suggestions}
                    onSelect={selectSuggestion}
                />
            </div>
        </div>
    );
}

export function StatusField({
    t,
    value,
    onChange,
}: {
    t: (key: string) => string;
    value: TaskStatus;
    onChange: (value: TaskStatus) => void;
}) {
    const options: Array<PillOption<TaskStatus>> = [
        { value: 'inbox', label: t('status.inbox') },
        { value: 'next', label: t('status.next') },
        { value: 'waiting', label: t('status.waiting') },
        { value: 'someday', label: t('status.someday') },
        ...(value === 'reference' ? [{ value: 'reference' as const, label: t('status.reference') }] : []),
        { value: 'done', label: t('status.done') },
        { value: 'archived', label: t('status.archived') },
    ];

    return (
        <PillOptionField
            ariaLabel={t('task.aria.status')}
            label={t('taskEdit.statusLabel')}
            options={options}
            value={value}
            onChange={onChange}
        />
    );
}

export function PriorityField({
    t,
    value,
    onChange,
}: {
    t: (key: string) => string;
    value: TaskPriority | '';
    onChange: (value: TaskPriority | '') => void;
}) {
    const options: Array<PillOption<TaskPriority | ''>> = [
        { value: '', label: t('common.none') },
        { value: 'low', label: t('priority.low') },
        { value: 'medium', label: t('priority.medium') },
        { value: 'high', label: t('priority.high') },
        { value: 'urgent', label: t('priority.urgent') },
    ];

    return (
        <PillOptionField
            ariaLabel={t('taskEdit.priorityLabel')}
            label={t('taskEdit.priorityLabel')}
            options={options}
            value={value}
            onChange={onChange}
        />
    );
}

export function EnergyLevelField({
    t,
    value,
    onChange,
}: {
    t: (key: string) => string;
    value: NonNullable<TaskEnergyLevel> | '';
    onChange: (value: NonNullable<TaskEnergyLevel> | '') => void;
}) {
    const options: Array<PillOption<NonNullable<TaskEnergyLevel> | ''>> = [
        { value: '', label: t('common.none') },
        { value: 'low', label: t('energyLevel.low') },
        { value: 'medium', label: t('energyLevel.medium') },
        { value: 'high', label: t('energyLevel.high') },
    ];

    return (
        <PillOptionField
            ariaLabel={t('taskEdit.energyLevel')}
            label={t('taskEdit.energyLevel')}
            options={options}
            value={value}
            onChange={onChange}
        />
    );
}

export function AssignedToField({
    t,
    value,
    options = [],
    onChange,
}: {
    t: (key: string) => string;
    value: string;
    options?: string[];
    onChange: (value: string) => void;
}) {
    return (
        <AutocompleteTextField
            ariaLabel={t('taskEdit.assignedTo')}
            label={t('taskEdit.assignedTo')}
            options={options}
            placeholder={t('taskEdit.assignedToPlaceholder')}
            value={value}
            onChange={onChange}
        />
    );
}

export function TimeEstimateField({
    t,
    value,
    onChange,
}: {
    t: (key: string) => string;
    value: TimeEstimate | '';
    onChange: (value: TimeEstimate | '') => void;
}) {
    return (
        <div className="flex flex-col gap-1 w-full">
            <label className={taskEditorLabelClassName}>{t('taskEdit.timeEstimateLabel')}</label>
            <select
                value={value}
                aria-label={t('task.aria.timeEstimate')}
                onChange={(event) => onChange(event.target.value as TimeEstimate | '')}
                className="text-xs bg-muted/50 border border-border rounded px-2 py-1 w-full text-foreground"
            >
                <option value="">{t('common.none')}</option>
                <option value="5min">5m</option>
                <option value="10min">10m</option>
                <option value="15min">15m</option>
                <option value="30min">30m</option>
                <option value="1hr">1h</option>
                <option value="2hr">2h</option>
                <option value="3hr">3h</option>
                <option value="4hr">4h</option>
                <option value="4hr+">4h+</option>
            </select>
        </div>
    );
}

export function ContextsField({
    t,
    value,
    options,
    suggestions,
    onChange,
}: {
    t: (key: string) => string;
    value: string;
    options: string[];
    suggestions?: string[];
    onChange: (value: string) => void;
}) {
    return (
        <ToggleTokenField
            ariaLabel={t('task.aria.contexts')}
            label={t('taskEdit.contextsLabel')}
            options={options}
            suggestions={suggestions}
            placeholder={t('taskEdit.contextsPlaceholder')}
            value={value}
            onChange={onChange}
        />
    );
}

export function TagsField({
    t,
    value,
    options,
    suggestions,
    onChange,
}: {
    t: (key: string) => string;
    value: string;
    options: string[];
    suggestions?: string[];
    onChange: (value: string) => void;
}) {
    return (
        <ToggleTokenField
            ariaLabel={t('task.aria.tags')}
            label={t('taskEdit.tagsLabel')}
            options={options}
            suggestions={suggestions}
            placeholder={t('taskEdit.tagsPlaceholder')}
            value={value}
            onChange={onChange}
        />
    );
}
