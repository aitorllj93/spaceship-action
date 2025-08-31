import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const cwd = process.cwd()

const WORK_DIR = join(cwd, 'tmp')
const VAULT_DIR = join(WORK_DIR, 'vault')
const TEMPLATE_DIR = join(WORK_DIR, 'spaceship')
const BUILD_DIR = join(TEMPLATE_DIR, 'dist')

const INPUTS_TO_ENVS = new Map([
  ['base', 'SPACESHIP_BASE'],
  ['site', 'SPACESHIP_SITE'],
  ['default_locale', 'SPACESHIP_DEFAULT_LOCALE'],
  ['title', 'SPACESHIP_TITLE'],
  ['description', 'SPACESHIP_DESCRIPTION'],
  ['logo', 'SPACESHIP_LOGO'],
  ['author', 'SPACESHIP_AUTHOR'],
  [
    'features_article_author_enabled',
    'SPACESHIP_FEATURES_ARTICLE_AUTHOR_ENABLED'
  ],
  ['features_article_date_enabled', 'SPACESHIP_FEATURES_ARTICLE_DATE_ENABLED'],
  ['features_right_mode', 'SPACESHIP_FEATURES_RIGHT_MODE'],
  ['features_right_map_enabled', 'SPACESHIP_FEATURES_RIGHT_MAP_ENABLED'],
  ['features_right_graph_enabled', 'SPACESHIP_FEATURES_RIGHT_GRAPH_ENABLED'],
  ['features_right_toc_enabled', 'SPACESHIP_FEATURES_RIGHT_TOC_ENABLED'],
  ['features_right_links_enabled', 'SPACESHIP_FEATURES_RIGHT_LINKS_ENABLED'],
  [
    'features_right_backlinks_enabled',
    'SPACESHIP_FEATURES_RIGHT_BACKLINKS_ENABLED'
  ]
])

const buildEnvFile = (extras: Map<string, string>) => {
  let result = ''

  for (const [key, val] of Array.from(INPUTS_TO_ENVS)) {
    result += `${val}=${core.getInput(key)}\n`
  }

  for (const [key, val] of Array.from(extras)) {
    result += `${key}=${val}\n`
  }

  return result
}

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    await exec.exec(`rm -fr ${TEMPLATE_DIR}`)

    const template: string = core.getInput('template')
    const [repository, branch = 'main'] = template.split('#')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(
      `Checking out template "${repository}" with branch "${branch}"...`
    )

    await exec.exec(
      `git clone --depth=1 --branch=${branch} https://github.com/${repository}.git ${TEMPLATE_DIR}`
    )

    await exec.exec('npm install', [], {
      cwd: TEMPLATE_DIR
    })

    core.debug('Generating env file...')

    const env = buildEnvFile(new Map([['OBSIDIAN_VAULT_DIR', VAULT_DIR]]))

    core.debug(env)

    await writeFile(join(TEMPLATE_DIR, '.env'), env)

    core.debug('Building pages...')

    await exec.exec('npm run build', [], {
      cwd: TEMPLATE_DIR
    })

    // Set outputs for other workflow steps to use
    core.setOutput('build_dir', BUILD_DIR)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
