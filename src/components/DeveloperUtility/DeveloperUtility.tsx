/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react'

import classNames from 'classnames'

import WrenchIcon from '../../../public/icons/wrench.svg'

import ContextMenuAdjustment from './ContextMenuAdjustment'
import styles from './DeveloperUtility.module.scss'
import NavbarAdjustment from './NavbarAdjustment'
import NotesAdjustment from './NotesAdjustment'

import Separator from 'src/components/dls/Separator/Separator'

/**
 * A set of developer utilities only availble on development environments
 *
 * @returns {JSX.Element}
 */
const DeveloperUtility = (): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false)

  // only show the developer utilities if we're in development mode
  // if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
  // return <></>;
  // }

  if (!isExpanded) {
    return (
      <button
        className={classNames(styles.container)}
        aria-label="developer-utility"
        type="button"
        onClick={() => setIsExpanded(true)}
      >
        <WrenchIcon className={styles.wrench} />
      </button>
    )
  }

  return (
    <button
      className={classNames(styles.container, styles.containerExpanded)}
      aria-label="developer-utility"
      type="button"
    >
      Developer Utility
      <div className={styles.separator}>
        <Separator />
      </div>
      <NotesAdjustment />
      <NavbarAdjustment />
      <ContextMenuAdjustment />
      <div>
        <button
          clasjksName={styles.closeButton}
          type="button"
          onClick={() => setIsExpanded(false)}
        >
          close
        </button>
      </div>
    </button>
  )
}

export default DeveloperUtility
