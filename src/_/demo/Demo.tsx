import React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useHash } from "react-use";
import { stringify, parse } from "qs";
import { clamp, debounce } from "lodash";

import styles from "./demo.module.scss";

type Props = {
  title: React.ReactNode;
};

export const Demo: React.FunctionComponent<Props> = ({ title, children }) => {
  const sectionsRef = useRef<HTMLDivElement>(null);
  const [hash, setHash] = useHash();
  const hashParams = parse((hash || "#").substr(1));

  const minSection = 0;
  const maxSection = React.Children.count(children) - 1;
  // @ts-ignore
  const currentSection = parseInt(hashParams.section || "0");

  const scrollToSection = useCallback(
    (sectionIndex) => {
      const sections = sectionsRef.current;
      if (!sections) return;
      const section = sections.children[
        clamp(sectionIndex, minSection, maxSection)
      ] as HTMLDivElement;

      section?.scrollIntoView({
        behavior: "smooth",
      });
    },
    [maxSection]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      scrollToSection(currentSection);
    }, 100);
    return () => clearTimeout(handler);
  }, [currentSection, scrollToSection]);

  const goToSection = useCallback(
    (sectionIndex: number) => {
      setHash(
        stringify({ section: clamp(sectionIndex, minSection, maxSection) })
      );
    },
    [maxSection, setHash]
  );

  const nextSection = useCallback(() => {
    goToSection(currentSection + 1);
  }, [currentSection, goToSection]);

  const prevSection = useCallback(() => {
    goToSection(currentSection - 1);
  }, [currentSection, goToSection]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateCurrentSection = useCallback(
    debounce((e: any) => {
      const newSection = Math.round(
        ((maxSection + 1) * e.target.scrollLeft) / e.target.scrollWidth
      );
      if (newSection !== currentSection) {
        goToSection(newSection);
      }
    }, 200),
    [goToSection, currentSection, maxSection]
  );

  return (
    <div className={styles.Demo}>
      <img
        src="/corner-tr.png"
        alt=""
        style={{ position: "absolute", right: 0, width: "30vw", zIndex: -1 }}
      />
      <img
        src="/corner-bl.png"
        alt=""
        style={{ position: "absolute", bottom: 0, width: "35vw", zIndex: -1 }}
      />
      <h1 className={styles.Demo__Title}>{title}</h1>
      <div
        ref={sectionsRef}
        className={styles.Demo__Sections}
        onScroll={updateCurrentSection}
      >
        {children}
      </div>
      {currentSection < maxSection && (
        <div
          className={`${styles.Demo__Button} ${styles.Demo__Button_Next}`}
          onClick={nextSection}
        >
          &gt;
        </div>
      )}
      {!!currentSection && (
        <div
          className={`${styles.Demo__Button} ${styles.Demo__Button_Prev}`}
          onClick={prevSection}
        >
          &lt;
        </div>
      )}
    </div>
  );
};
