# wp-plugin-check-action

A GitHub action to run [Plugin Check](https://wordpress.org/plugins/plugin-check/) against your plugin.

Results are posted as file annotations.

## Example

<img width="887" alt="Plugin Check error messages output on GitHub Actions" src="https://github.com/swissspidy/wp-plugin-check-action/assets/841956/31292472-51d5-487d-9878-1940a20e1e0b">

## Usage

### Basic Example

The simplest way to get up and running with your plugin.

Add a workflow (`.github/workflows/build-test.yml`):

```yaml
name: 'build-test'
on: # rebuild any PRs and main branch changes
  pull_request:
  push:
    branches:
    - main
    - 'releases/*'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Run plugin check
      uses: swissspidy/wp-plugin-check-action@v1
```

### Advanced Usage

The basic example above covers many use cases, but sometimes plugins can be a bit more
complex and involve some sort of build process.
Also, if you already use tools like PHPCS, you might want to use the PHPCS-based checks
from Plugin Check but focus on the ones that are more useful for you.

```yaml
name: 'build-test'
on: # rebuild any PRs and main branch changes
  pull_request:
  push:
    branches:
    - main
    - 'releases/*'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v3

# Here's where you would run your custom build process
# ...
# ...

    - name: Build plugin
      run: npm run build

    - name: Run plugin check
      uses: swissspidy/wp-plugin-check-action@v1
      with:
        build-dir: './my-awesome-plugin'
        exclude-directories: 'prefixed_vendor_dir,another_dir_to_ignore'
        categories: |
          performance
          accessibility
```

### Inputs

The following inputs are supported:

* `build-dir` (string): path to the build directory if there is a build process involved.
  **Note:** file annotations will still be made against the source files.
* `checks` (string): only run specific checks, separated by comma or newline.
* `categories` (string): only run checks from specific categories, separated by comma or newline.
* `exclude-directories` (string): additional directories to exclude from checks, separated by comma or newline. 
  By default, `.git`, `vendor` and `node_modules` directories are excluded.
* `ignore-warnings` (bool): ignore warnings.
* `ignore-errors` (bool): ignore errors.
* `include-experimental` (bool): include experimental checks.

#### Supported Checks

At the moment, the following checks exist:

* `i18n_usage`
* `enqueued_scripts_size`
* `code_obfuscation`
* `file_type`
* `plugin_header_text_domain`
* `late_escaping`
* `plugin_updater`
* `plugin_review_phpcs`
* `performant_wp_query_params`
* `enqueued_scripts_in_footer`
* `plugin_readme`
* `enqueued_styles_scope`
* `localhost`
* `no_unfiltered_uploads`
* `trademarks`

#### Supported Categories

At the moment, the following categories exist:

* `general`
* `plugin_repo`
* `security`
* `performance`
* `accessibility`
